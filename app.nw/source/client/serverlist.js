
// Define URLs for known API servers
var apiServer = [
  {
    id:'q',
    url:'https://api-q.leadformance.com',
    name:'Internal QA (.q)'
  },
  {
    id:'c',
    url:'https://api-c.leadformance.com',
    name:'Client QA (.c)'
  },
  {
    id:'i',
    url:'https://api-i.leadformance.com',
    name:'Integrator (.i)'
  },
  {
    id:'s',
    url:'https://api-s.leadformance.com',
    name:'Staging (.s)'
  }
];

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
