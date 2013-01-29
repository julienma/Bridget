// Define URLs for known API servers
var apiServer;

// Make a function so we can update the list when we update the auth
function updateApiServer() {
  apiServer = [
    {
      id:'q',
      url:'https://' + global.authLogin + ':' + global.authPassword + '@api.q.leadformance.com',
      name:'Internal QA (.q)'
    },
    {
      id:'c',
      url:'https://' + global.authLogin + ':' + global.authPassword + '@api.c.leadformance.com',
      name:'Client QA (.c)'
    },
    {
      id:'i',
      url:'https://' + global.authLogin + ':' + global.authPassword + '@api.i.leadformance.com',
      name:'Integrator (.i)'
    },
    {
      id:'s',
      url:'https://' + global.authLogin + ':' + global.authPassword + '@api.s.leadformance.com',
      name:'Staging (.s)'
    }
  ];
}

// Run once so we have a first reference of apiServer
updateApiServer();

/*
Find details (url, name) about a server, given its id ('c', 'q', etc.)
Usage: console.log(getServerDetails('c').url); (or .name/.id)
*/

function getServerDetails(id){
  for(var i = 0; i<apiServer.length; i++){
      var item = apiServer[i];
      if(item.id === id) {
        return item;
      }
  }
  return false;
}


/*
Make this code usable in both node and the browser, by exporting only if in node ('exports' does not exist in browser)

# Usage:
## In Node
var apiServer = require('serverlist.js').apiServer;

## In Browser
<script src="serverlist.js"></script>
<script>
    alert(apiServer);
    getServerDetails(id);
</script>

*/

if (typeof exports !== 'undefined') {
  exports.apiServer = apiServer;
  exports.getServerDetails = getServerDetails;
}
