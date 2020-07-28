var http = require('http');
var request = require('request');
var fs = require('fs');
var csv = require('csv');
var url = require('url');


var json_request_body = undefined;
var csv_request_body = undefined;
var html_content = undefined;

function createHtmlStringFromJson(retrievedData) {

    var body_begin_index = html_content.indexOf('<body>');
    var body_end_index = html_content.indexOf('</body>');

    var string_until_body = html_content.slice(0, body_begin_index + 6);
    var string_from_body = html_content.slice(body_end_index);


    var html_string = '<table>\n'
    html_string += '<tr>\n';
    for (var attribute in retrievedData[0]) {

        if (typeof retrievedData[0][attribute] !== 'object') {

            html_string += '<td>' + attribute + '</td>\n';
        }
    }
    html_string += '</tr>'


    retrievedData.forEach(function(object) {
        html_string += '</tr>\n'
        for (var attribute in object) {

            if (typeof object[attribute] !== 'object') {

                html_string += '<td>' + object[attribute] + '</td>\n';
            }
        }
        html_string += '</tr>\n'


    })



    html_string += '</table>';
    return string_until_body + html_string + string_from_body;

}

function createHtmlStringFromCsv(retrievedData) {

    var body_begin_index = html_content.indexOf('<body>');
    var body_end_index = html_content.indexOf('</body>');

    var string_until_body = html_content.slice(0, body_begin_index + 6);
    var string_from_body = html_content.slice(body_end_index);


    var html_string = '<table>\n'
    html_string += '<tr>\n';
    retrievedData[0].forEach(function(attribute) {
        html_string += '<td>' + attribute + '</td>\n';
    });

    html_string += '</tr>\n'

    var data = retrievedData.slice(1);

    data.forEach(function(row) {
        html_string += '</tr>\n'
        row.forEach(function(cell) {
            html_string += '<td>' + cell + '</td>\n';
        });
        html_string += '</tr>\n'
    })



    html_string += '</table>';
    return string_until_body + html_string + string_from_body;

}

request('https://www.bnefoodtrucks.com.au/api/1/trucks', function(err, request_res, body) {

    json_request_body = body;

});

request('https://www.data.brisbane.qld.gov.au/data/dataset/edeb4918-34d0-428c-857d-70f8983af1b3/resource/69ed0503-43db-4873-abd6-9fcc500b805b/download/cars-srsa-open-data-food-safety-permits-1-july-2020.csv', function(err, request_res, body) {
    csv.parse(body, function(err, data) {
        csv_request_body = data;

    });
});




http.createServer(function(req, res) {

    if (json_request_body && csv_request_body && html_content) {

        res.writeHead(200, { 'Content-Type': 'text/html' });
        var request_url = url.parse(req.url);
        switch (request_url.path) {
            case '/json':
                res.end(createHtmlStringFromJson(JSON.parse(json_request_body)));
                break;
            case '/csv':
                res.end(createHtmlStringFromCsv(csv_request_body))
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