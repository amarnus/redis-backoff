# Goals

- Avoid explosion of timers - unwieldy, unmanageable.
- Best-effort resilient scheduling i.e. it shouldn't be interfered by a system restart.
- No external storage to keep track of retry state.
- Run everything in memory.
