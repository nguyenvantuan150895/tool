const yargs = require('yargs');
const fs = require('fs');
const cmd = require('node-cmd');
const promise = require('bluebird');

let argv = yargs.argv;
let domain = argv._[0];
let port; let last_port;let data;

// create & save port number
fs.appendFileSync('/home/port.txt','', 'utf8');// console.log("rs:", rs);
data = fs.readFileSync('/home/port.txt', 'utf8'); //console.log("Data:", data);
if(data.length == 0) {
    port = 3000;
    data = port.toString();
    fs.appendFileSync('/home/port.txt', data, 'utf8');
}
else{
    let arr = data.split(",");
    last_port = arr[arr.length -1];
    port = Number(last_port) + 1;
    data = ','+ port.toString();
    fs.appendFileSync('/home/port.txt', data, 'utf8');
}
// create file config Nginx
let ip_server = "192.168.31.253:" + port.toString();
let content = 
"server {" +
    "listen 80;" +
    "server_name "+domain+" www."+domain+ ";" +
    'location / {' +
        'proxy_pass '+ip_server+';' +
        'proxy_http_version 1.1;' +
        'proxy_set_header Upgrade $http_upgrade;' +
        "proxy_set_header Connection 'upgrade';" + 
        'proxy_set_header Host $http_host;' +
        
        'proxy_set_header X-Real-IP $remote_addr;' +
        'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'+

        'proxy_set_header HTTP_Country-Code $geoip_country_code;' +
        'proxy_cache_bypass $http_upgrade;' +
        'proxy_pass_request_headers on;' +
    'location ~ /\.ht {' +
        'deny all;' +
    '}' +
"}"
let namefile = domain + '.conf';

let path = '/etc/nginx/conf.d/' + namefile;
fs.writeFile(path, content, function (err) {
    if (err) throw err;
    console.log('Save file config nginx done!');
});

// Create a folder code for each domain
let comand = 'cp -R /home/tuan/web/DoAn/'+' '+'/home/tuan/web/'+domain;
const getAsync = promise.promisify(cmd.get, { multiArgs: true, context: cmd })
getAsync(comand).then(data => {
    let path_domain = '/home/tuan/web/'+domain+'/domain.txt';
    let path_port = '/home/tuan/web/'+domain+'/port.txt';
    fs.writeFile(path_domain, domain, function (err) {
        if (err) throw err;
        console.log('Save domain done!');
    });
    fs.writeFile(path_port, port, function (err) {
        if (err) throw err;
        console.log('Save port done!');
    });

    cmd.run('sudo service nginx restart');
}).catch(err => {
  console.log('cmd err', err)
})
