export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  variables: string[];
  steps: string[];
  lastUsed: string;
  lastUsedTimestamp: number;
  createdTimestamp: number;
  timesUsed: number;
  isFavorite: boolean;
}

export const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Deploy Website",
    description: "Automated production deployment workflow for static websites and SPAs.",
    category: "DevOps",
    difficulty: "Easy",
    estimatedTime: "10 mins",
    variables: ["repo_url", "branch_name", "build_command"],
    steps: [
      "Pull latest main branch",
      "Run npm install",
      "Run npm run build",
      "Run audit tests",
      "Copy build output to static folder",
      "Reload reverse proxy"
    ],
    lastUsed: "2 hours ago",
    lastUsedTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    timesUsed: 124,
    isFavorite: true
  },
  {
    id: "2",
    name: "Redis Cache Recovery",
    description: "Evict keys, reset connection pools, and clear high-latency queues in Redis.",
    category: "Database",
    difficulty: "Hard",
    estimatedTime: "15 mins",
    variables: ["redis_host", "redis_port", "max_memory_limit", "eviction_policy"],
    steps: [
      "Verify CPU and memory usage",
      "Check connection counts",
      "Switch eviction policy to allkeys-lru",
      "Kill client connections",
      "Check log files for slow logs",
      "Scale Redis cluster nodes",
      "Test connection latency",
      "Notify system health monitors"
    ],
    lastUsed: "Yesterday",
    lastUsedTimestamp: Date.now() - 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 40 * 24 * 60 * 60 * 1000,
    timesUsed: 48,
    isFavorite: false
  },
  {
    id: "3",
    name: "PostgreSQL Database Rollback",
    description: "Revert migration schema and restore standard postgres tables to the last stable transaction checkpoint.",
    category: "Database",
    difficulty: "Hard",
    estimatedTime: "20 mins",
    variables: ["db_host", "db_name", "db_user", "target_version", "backup_file"],
    steps: [
      "Connect to db instance",
      "Check active transactions count",
      "Kill running queries",
      "Restore schema rollback from backup",
      "Run post-schema integrity tests",
      "Verify system endpoints health"
    ],
    lastUsed: "3 days ago",
    lastUsedTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    timesUsed: 14,
    isFavorite: false
  },
  {
    id: "4",
    name: "Kubernetes CrashLoopBackOff Resolution",
    description: "Inspect crashlogs, trace container exit code 137 (OOM), and patch spec deployment settings.",
    category: "Kubernetes",
    difficulty: "Medium",
    estimatedTime: "12 mins",
    variables: ["namespace", "deployment_name", "container_name", "new_memory_limit"],
    steps: [
      "Describe pod specs and events",
      "Check container logs",
      "Verify Exit Code 137",
      "Patch deployment spec to increase memory limit",
      "Wait for rollout to finish",
      "Verify memory usage stability"
    ],
    lastUsed: "4 hours ago",
    lastUsedTimestamp: Date.now() - 4 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    timesUsed: 92,
    isFavorite: true
  },
  {
    id: "5",
    name: "Docker Container Startup Failure",
    description: "Trace missing build artifacts inside multistage docker builds and rebuild cached layers.",
    category: "Docker",
    difficulty: "Medium",
    estimatedTime: "8 mins",
    variables: ["image_name", "image_tag", "registry_url"],
    steps: [
      "Inspect docker container error logs",
      "Analyze Dockerfile build stage structure",
      "Add COPY commands for compiled files",
      "Build Docker image locally",
      "Push Docker image to registry"
    ],
    lastUsed: "Last week",
    lastUsedTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    timesUsed: 37,
    isFavorite: false
  },
  {
    id: "6",
    name: "AWS S3 Glacier Archival Backup",
    description: "Automated AWS lifecycle transition and cold storage database archival backups.",
    category: "AWS",
    difficulty: "Easy",
    estimatedTime: "5 mins",
    variables: ["source_snapshot_id", "s3_bucket_name", "glacier_transition_days"],
    steps: [
      "Locate database snapshots",
      "Upload snapshots to S3 archive bucket",
      "Verify upload checksums",
      "Apply lifecycle transition rules to Glacier"
    ],
    lastUsed: "3 hours ago",
    lastUsedTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 50 * 24 * 60 * 60 * 1000,
    timesUsed: 341,
    isFavorite: false
  },
  {
    id: "7",
    name: "NGINX SSL/TLS Certificate Rotation",
    description: "Renew Let's Encrypt certificates, verify NGINX config file syntax, and reload service daemon.",
    category: "Linux",
    difficulty: "Easy",
    estimatedTime: "6 mins",
    variables: ["domain_name", "config_file_path", "certbot_flags"],
    steps: [
      "Run certbot renewal command",
      "Check active SSL certificate validity",
      "Verify NGINX configuration syntax",
      "Reload systemd nginx service",
      "Check client SSL handshake response"
    ],
    lastUsed: "Yesterday",
    lastUsedTimestamp: Date.now() - 18 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 25 * 24 * 60 * 60 * 1000,
    timesUsed: 82,
    isFavorite: false
  },
  {
    id: "8",
    name: "Payment API Gateway Timeout Fix",
    description: "Troubleshoot network drops and rate limiting issues on Payment API gateway routes.",
    category: "Networking",
    difficulty: "Hard",
    estimatedTime: "18 mins",
    variables: ["payment_gateway_url", "proxy_address", "timeout_limit", "retry_attempts"],
    steps: [
      "Check external API response codes",
      "Inspect gateway firewall traffic blocks",
      "Check client-side payload sizes",
      "Verify proxy rewrite routing rules",
      "Test outbound network connections"
    ],
    lastUsed: "Yesterday",
    lastUsedTimestamp: Date.now() - 22 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    timesUsed: 61,
    isFavorite: false
  },
  {
    id: "9",
    name: "GitHub Actions Workflow Deploy",
    description: "Troubleshoot failed GitHub Actions runner runs, cache clears, and credentials setup.",
    category: "DevOps",
    difficulty: "Medium",
    estimatedTime: "11 mins",
    variables: ["repo_name", "workflow_id", "runner_label"],
    steps: [
      "Inspect GitHub Actions logs",
      "Clear runner build cache",
      "Check action secrets setup",
      "Re-run build jobs",
      "Validate target container state"
    ],
    lastUsed: "5 mins ago",
    lastUsedTimestamp: Date.now() - 5 * 60 * 1000,
    createdTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    timesUsed: 521,
    isFavorite: true
  },
  {
    id: "10",
    name: "Linux Server Out of Disk Space Cleanup",
    description: "Find large files, clear journald system logs, and optimize inodes capacity on root partition.",
    category: "Linux",
    difficulty: "Medium",
    estimatedTime: "10 mins",
    variables: ["target_directory", "max_log_size", "prune_docker_cache"],
    steps: [
      "Scan filesystem for large folders",
      "Prune docker dangling images and cache",
      "Truncate logs under journald directory",
      "Clean package manager dependencies",
      "Verify disk block usage"
    ],
    lastUsed: "2 days ago",
    lastUsedTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
    timesUsed: 110,
    isFavorite: false
  },
  {
    id: "11",
    name: "Datadog High Latency Alert Fix",
    description: "Trace latency spikes, debug thread pools exhaustion, and increase worker process count.",
    category: "Monitoring",
    difficulty: "Medium",
    estimatedTime: "14 mins",
    variables: ["datadog_api_key", "application_name", "max_worker_processes"],
    steps: [
      "Check Datadog APM tracing dashboard",
      "Identify high-latency queries",
      "Examine application thread pool status",
      "Adjust server process worker count",
      "Restart application daemon",
      "Confirm latency metrics stabilization"
    ],
    lastUsed: "4 hours ago",
    lastUsedTimestamp: Date.now() - 4.5 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
    timesUsed: 89,
    isFavorite: false
  },
  {
    id: "12",
    name: "API Version Rollback Workflow",
    description: "Instantly rollback API microservice image version in production environment.",
    category: "DevOps",
    difficulty: "Medium",
    estimatedTime: "8 mins",
    variables: ["service_name", "rollback_version", "notification_channel"],
    steps: [
      "Identify running container image versions",
      "Update configuration to previous stable version",
      "Restart container deployment",
      "Verify API endpoints response codes",
      "Notify devops alert channel"
    ],
    lastUsed: "Yesterday",
    lastUsedTimestamp: Date.now() - 20 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    timesUsed: 43,
    isFavorite: false
  },
  {
    id: "13",
    name: "Credential Leak Remediation",
    description: "Remediate leaked API keys or passwords, revoke credentials, and rotate auth tokens in database.",
    category: "Security",
    difficulty: "Hard",
    estimatedTime: "25 mins",
    variables: ["compromised_service", "vault_key_path", "secret_name", "target_env"],
    steps: [
      "Locate source of leaked credentials",
      "Revoke compromised tokens/keys",
      "Generate new secure API credentials",
      "Inject new credentials into production vault",
      "Restart active service pods",
      "Audit system access logs for anomalies"
    ],
    lastUsed: "Last month",
    lastUsedTimestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
    timesUsed: 12,
    isFavorite: false
  },
  {
    id: "14",
    name: "Production Schema Migration",
    description: "Apply database schema changes, migrate data, and check constraints without downtime.",
    category: "Database",
    difficulty: "Hard",
    estimatedTime: "30 mins",
    variables: ["db_connection_string", "migration_version", "index_name", "dry_run_flag"],
    steps: [
      "Run database dry-run migration test",
      "Create database checkpoint backup",
      "Execute migration scripts",
      "Apply index updates concurrently",
      "Validate foreign key constraints",
      "Verify read/write query speeds"
    ],
    lastUsed: "3 days ago",
    lastUsedTimestamp: Date.now() - 3.2 * 24 * 60 * 60 * 1000,
    createdTimestamp: Date.now() - 11 * 24 * 60 * 60 * 1000,
    timesUsed: 28,
    isFavorite: false
  },
  {
    id: "15",
    name: "TCP/HTTP Service Health Check",
    description: "Perform network connectivity checks, parse JSON status payloads, and verify SSL handshakes.",
    category: "Monitoring",
    difficulty: "Easy",
    estimatedTime: "5 mins",
    variables: ["health_endpoint_url", "expected_status_code", "timeout_seconds"],
    steps: [
      "Perform ping test to remote host",
      "Check HTTP status code at health endpoint",
      "Verify SSL certificate expiration details",
      "Check JSON response payload format"
    ],
    lastUsed: "10 mins ago",
    lastUsedTimestamp: Date.now() - 10 * 60 * 1000,
    createdTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    timesUsed: 1202,
    isFavorite: false
  }
];
