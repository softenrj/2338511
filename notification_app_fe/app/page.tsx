'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Grid, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Alert, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Notification } from '@/types/notification';
import { NotificationCard } from '@/components/NotificationCard';
import { logger } from '@/utils/loggerClient';

export default function DashboardFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('viewed_notifications');
    if (saved) setViewedIds(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const fetchActiveStream = async () => {
      setLoading(true);
      setError(null);
      await logger.info('api', `Triggering live fetch for page: ${page}, limit: ${limit}, filter: ${typeFilter}`);

      try {
        let targetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications?page=${page}&limit=${limit}`;
        if (typeFilter !== 'ALL') {
          targetUrl += `&notification_type=${typeFilter}`;
        }

        const res = await fetch(targetUrl, {
          headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` }
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        setNotifications(data.notifications || []);
        await logger.info('state', `Fetched ${data.notifications?.length || 0} notifications.`);
      } catch (err: any) {
        setError(err.message);
        await logger.error('component', `Fetch failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveStream();
  }, [page, limit, typeFilter]);

  const handleMarkViewed = async (id: string) => {
    const updated = [...viewedIds, id];
    setViewedIds(updated);
    localStorage.setItem('viewed_notifications', JSON.stringify(updated));
    await logger.debug('hook', `Marked as viewed: ${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            📬 Central Stream
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time processing dashboard for academic notifications
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, minWidth: 320, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 140 }}>
            <InputLabel>Type Filter</InputLabel>
            <Select
              value={typeFilter}
              label="Type Filter"
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="Placement">Placements</MenuItem>
              <MenuItem value="Result">Results</MenuItem>
              <MenuItem value="Event">Events</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 120 }}>
            <InputLabel>Page Limit</InputLabel>
            <Select
              value={limit}
              label="Page Limit"
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              <MenuItem value={5}>5 Items</MenuItem>
              <MenuItem value={10}>10 Items</MenuItem>
              <MenuItem value={20}>20 Items</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      ) : notifications.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No notifications found for the selected filter.
        </Alert>
      ) : (
        <Grid container>
          <Grid item xs={12}>
            {notifications.map((item) => (
              <NotificationCard
                key={item.ID}
                item={item}
                isViewed={viewedIds.includes(item.ID)}
                onMarkRead={handleMarkViewed}
              />
            ))}
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: '1px solid #E2E8F0' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          disabled={page === 1}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          Back
        </Button>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Page {page}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          disabled={notifications.length < limit}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}