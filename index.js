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
"server {\n" +
    "    listen 80;\n" +
    "    server_name "+domain+" www."+domain+";\n" +
    '    location / {\n' +
        '        proxy_pass http://'+ip_server+';\n' +
        '        proxy_http_version 1.1;\n' +
        '        proxy_set_header Upgrade $http_upgrade;\n' +
        "        proxy_set_header Connection 'upgrade';\n" + 
        '        proxy_set_header Host $http_host;\n' +
        
        '        proxy_set_header X-Real-IP $remote_addr;\n' +
        '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'+

        '        proxy_set_header HTTP_Country-Code $geoip_country_code;\n' +
        '        proxy_cache_bypass $http_upgrade;\n' +
        '        proxy_pass_request_headers on;\n' +
    '    }\n'+
    '    location ~ /\.ht {\n' +
        '        deny all;\n' +
    '    }\n' +
"}\n"



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
	//rename file server.js => 'domain.js'
	console.log('Please wait for minutes!');
	let name_sv = domain.split(".")[0]; name_sv = name_sv +'.js';
	cmd.run('mv /home/tuan/web/'+domain+'/server.js'+' '+'/home/tuan/web/'+domain+'/'+name_sv);
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
    cmd.run('pm2 start /home/tuan/web/'+domain+'/'+name_sv);

    
}).catch(err => {
  console.log('cmd err', err)
})
