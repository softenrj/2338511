'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Alert } from '@mui/material';
import StarRateIcon from '@mui/icons-material/StarRate';
import { Notification } from '@/types/notification';
import { NotificationCard } from '../../components/NotificationCard';
import { logger } from '../../utils/loggerClient';

export default function PrioritySmartInboxView() {
    const [priorityItems, setPriorityItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewedIds, setViewedIds] = useState<string[]>([]);

    const [nLimit, setNLimit] = useState(10);
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        const saved = localStorage.getItem('viewed_notifications');
        setViewedIds(saved ? JSON.parse(saved) : []);
    }, []);

    useEffect(() => {
        const processPriorityArray = async () => {
            setLoading(true);
            setError(null);
            await logger.info('page', `Processing priority inbox. Limit: ${nLimit}, Filter: ${typeFilter}`);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications?limit=50`, {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` }
                });

                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                let rawNotifications: Notification[] = data.notifications || [];

                if (typeFilter !== 'ALL') {
                    rawNotifications = rawNotifications.filter(item => item.Type === typeFilter);
                }

                const weightMap: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };
                const evaluated = [...rawNotifications].sort((a, b) => {
                    const aRead = viewedIds.includes(a.ID) ? 1 : 0;
                    const bRead = viewedIds.includes(b.ID) ? 1 : 0;

                    if (aRead !== bRead) return aRead - bRead;

                    const weightDiff = (weightMap[b.Type] ?? 0) - (weightMap[a.Type] ?? 0);
                    if (weightDiff !== 0) return weightDiff;

                    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
                });

                setPriorityItems(evaluated.slice(0, nLimit));
                await logger.info('state', `Priority list ready: ${evaluated.length} items sorted, showing top ${nLimit}.`);
            } catch (err: any) {
                setError(err.message);
                await logger.error('component', `Priority fetch failed: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        processPriorityArray();
    }, [nLimit, typeFilter, viewedIds]);

    return (
        <Box>
            <Box
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF8E1 100%)',
                    borderRadius: 4,
                    border: '1px solid #FFE082',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#5D4037', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarRateIcon sx={{ color: '#F57F17' }} /> Priority Inbox
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#795548', mt: 0.5 }}>
                        Top unread notifications sorted by importance and recency
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, minWidth: 300, ml: 'auto' }}>
                    <FormControl size="small" sx={{ bgcolor: '#FFFFFF', borderRadius: 1, minWidth: 140 }}> {/* ✅ bgcolor not bg */}
                        <InputLabel>Type Filter</InputLabel>
                        <Select
                            value={typeFilter}
                            label="Type Filter"
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Categories</MenuItem>
                            <MenuItem value="Placement">Placements Only</MenuItem>
                            <MenuItem value="Result">Results Only</MenuItem>
                            <MenuItem value="Event">Events Only</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ bgcolor: '#FFFFFF', borderRadius: 1, minWidth: 130 }}> {/* ✅ bgcolor not bg */}
                        <InputLabel>Top Limits (n)</InputLabel>
                        <Select
                            value={nLimit}
                            label="Top Limits (n)"
                            onChange={(e) => setNLimit(Number(e.target.value))}
                        >
                            <MenuItem value={5}>Top 5</MenuItem>
                            <MenuItem value={10}>Top 10</MenuItem>
                            <MenuItem value={15}>Top 15</MenuItem>
                            <MenuItem value={20}>Top 20</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#F57C00' }} />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : priorityItems.length === 0 ? (
                <Alert severity="info">No priority notifications matched your filter.</Alert>
            ) : (
                <Grid container>
                    <Grid item xs={12}>
                        {priorityItems.map((item) => (
                            <NotificationCard
                                key={item.ID}
                                item={item}
                                isViewed={viewedIds.includes(item.ID)}
                            />
                        ))}
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}