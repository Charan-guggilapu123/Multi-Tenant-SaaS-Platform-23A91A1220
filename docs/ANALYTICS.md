# Analytics & Reporting

## Key Metrics to Track

### User Analytics
- Daily active users (DAU)
- Monthly active users (MAU)
- User retention rate
- Churn rate

### Project Analytics
- Average projects per tenant
- Project completion rate
- Project duration

### Task Analytics
- Average tasks per project
- Task completion time
- Task priority distribution
- Overdue tasks

## Database Queries for Analytics

```javascript
// Daily active users
SELECT DATE(createdAt) as date, COUNT(DISTINCT userId) as active_users
FROM AuditLogs
WHERE tenantId = :tenantId
GROUP BY DATE(createdAt)
ORDER BY date DESC;

// Tasks by status
SELECT status, COUNT(*) as count
FROM Tasks
WHERE tenantId = :tenantId
GROUP BY status;
```

## Reporting Dashboard

```
Dashboard Views:
├─ Overview
│  ├─ Total Users
│  ├─ Total Projects
│  └─ Total Tasks
├─ User Analytics
│  ├─ Active Users (DAU/MAU)
│  ├─ User Roles Distribution
│  └─ Last Login Timeline
├─ Project Analytics
│  ├─ Projects by Status
│  ├─ Average Project Duration
│  └─ Project Progress
└─ Task Analytics
   ├─ Tasks by Status
   ├─ Task Completion Rate
   └─ Overdue Tasks
```

## Export Capabilities

```
Supported Formats:
- CSV (Excel compatible)
- JSON (API-ready)
- PDF (Professional reports)
- Google Sheets (Real-time sync)
```
