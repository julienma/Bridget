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
Usage: console.log(getServerDetails('c')[0].url);
*/
function getServerDetails(id){
  return $.grep(apiServer, function(item){
    if (item.id == id) {
      return item;
    }
  });
}
