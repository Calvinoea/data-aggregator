var http = require('http');
var request = require('request');
var fs = require('fs');
var csv = require('csv');
var url = require('url');
var create_html = require('./create_html.js')


var json_request_body = undefined;
var csv_request_body = undefined;
var html_content = undefined;


setInterval(function() {

    request('https://www.bnefoodtrucks.com.au/api/1/trucks', function(err, request_res, body) {

        json_request_body = body;

    });

}, 2000);

setInterval(function() {

    request('https://www.data.brisbane.qld.gov.au/data/dataset/edeb4918-34d0-428c-857d-70f8983af1b3/resource/69ed0503-43db-4873-abd6-9fcc500b805b/download/cars-srsa-open-data-food-safety-permits-1-july-2020.csv', function(err, request_res, body) {
        csv.parse(body, function(err, data) {
            csv_request_body = data;

        });
    });
}, 2000)







http.createServer(function(req, res) {

    if (json_request_body && csv_request_body && html_content) {

        res.writeHead(200, { 'Content-Type': 'text/html' });
        var request_url = url.parse(req.url);
        switch (request_url.path) {
            case '/json':
                res.end(create_html.createHtmlStringFromJson(html_content, JSON.parse(json_request_body)));
                break;
            case '/csv':
                res.end(create_html.createHtmlStringFromCsv(html_content, csv_request_body))
                break;
        }

    } else {

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Nothing retrieved yet');
    }

}).listen(8080);

fs.readFile('./index.html', function(err, html) {

    if (err) {
        throw err;

    }

    html_content = html;

})