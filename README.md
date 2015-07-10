# videoCTRL
Web-based realtime Media Composer

## THINK!
C - Client
S - WebSocket Server

### Connection Schema case 1
- establish connection
C send spec data
S store client as accepted
S send proper stage and corresponding objects
C request sources from objects via http
...
S update client on changes

### Connection Schema case 2
- establish connection
C send spec data
S store client as accepted
- synchronize timesteps
S send proper stage and current corresponding objects
C send cache capacities
S send near future keypoints
C request sources from objects via http (small to large)
...
S update client on future/chainging keypoints
