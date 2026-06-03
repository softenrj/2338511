'use client';

import React, { memo } from 'react';
import { Card, CardContent, Chip, Typography, Button, Stack, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import { Notification } from '@/types/notification';

interface NotificationCardProps {
    item: Notification;
    isViewed: boolean;
    onMarkRead?: (id: string) => void;
}

const CATEGORY_CONFIG = {
    Placement: {
        color: '#ef4444',
        bg: '#fef2f2',
        icon: <WorkIcon fontSize="small" />,
    },
    Result: {
        color: '#f59e0b',
        bg: '#fffbeb',
        icon: <SchoolIcon fontSize="small" />,
    },
    Event: {
        color: '#3b82f6',
        bg: '#eff6ff',
        icon: <EventIcon fontSize="small" />,
    },
};

export const NotificationCard = memo(
    ({ item, isViewed, onMarkRead }: NotificationCardProps) => {
        const meta = CATEGORY_CONFIG[item.Type];

        return (
            <Card
                sx={{
                    mb: 2,
                    borderRadius: 3,
                    borderLeft: `4px solid ${isViewed ? '#CBD5E1' : meta.color}`,
                    boxShadow: isViewed
                        ? '0 1px 2px rgba(0,0,0,.04)'
                        : '0 4px 12px rgba(0,0,0,.08)',
                    transition: 'all .2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    },
                }}
            >
                <CardContent>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        flexWrap="wrap"
                        spacing={1}
                        mb={2}
                    >
                        <Stack direction="row" spacing={1}>
                            <Chip
                                icon={meta.icon}
                                label={item.Type}
                                size="small"
                                sx={{
                                    bgcolor: meta.bg,
                                    color: meta.color,
                                    fontWeight: 600,
                                }}
                            />

                            {isViewed ? (
                                <Chip
                                    icon={<VisibilityIcon />}
                                    label="Read"
                                    size="small"
                                    variant="outlined"
                                />
                            ) : (
                                <Chip
                                    icon={<FiberNewIcon />}
                                    label="New"
                                    size="small"
                                    color="success"
                                />
                            )}
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                            {item.Timestamp}
                        </Typography>
                    </Stack>

                    <Typography
                        variant="body1"
                        sx={{
                            lineHeight: 1.7,
                            fontWeight: isViewed ? 400 : 600,
                            color: isViewed ? 'text.secondary' : 'text.primary',
                        }}
                    >
                        {item.Message}
                    </Typography>

                    {!isViewed && onMarkRead && (
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => onMarkRead(item.ID)}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Mark as Read
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    }
);

NotificationCard.displayName = 'NotificationCard';