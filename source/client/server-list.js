// TODO: see if there's any need to auth. If so, make sure to externalize this in a json (loaded through nconf), and .gitignore it
var authLogin = '';
var authPwd = '';

// Define URLs for known API servers
var apiServer = [
  {
    id:'q',
    url:'https://' + authLogin + ':' + authPwd + '@api-q.leadformance.com',
    name:'Internal QA (.q)'
  },
  {
    id:'c',
    url:'https://' + authLogin + ':' + authPwd + '@api-c.leadformance.com',
    name:'Client QA (.c)'
  },
  {
    id:'i',
    url:'https://' + authLogin + ':' + authPwd + '@api-i.leadformance.com',
    name:'Integrator (.i)'
  },
  {
    id:'s',
    url:'https://' + authLogin + ':' + authPwd + '@api-s.leadformance.com',
    name:'Staging (.s)'
  }
];

/*
Find details (url, name) about a server, given its id ('c', 'q', etc.)
Usage: console.log(getServerDetails('c')[0].url);
SIMILAR to NJSgetServerDetails() in server/template.js, but needs jQuery (and wouldn't work as is within NodeJS)
*/
function getServerDetails(id){
  return $.grep(apiServer, function(item){
    if (item.id == id) {
      return item;
    }
  });
}