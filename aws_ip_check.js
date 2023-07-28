function checkIp(ip) {

    document.getElementById('results-table').hidden = true;

    fetch('https://ip-ranges.amazonaws.com/ip-ranges.json')
        .then((resp) => resp.json())
        .then((data) => data.prefixes)
        .then((prefixes) => {
            // Convert IP address to long integer
            function ip2long(ip) {
                var ipl = 0;
                ip.split('.').forEach(function (octet) {
                    ipl <<= 8;
                    ipl += parseInt(octet);
                });
                return (ipl >>> 0);
            }

            // Check if the input IP is in the CIDR range described by prefixes.ip_prefix. 
            var matchingPrefixes = prefixes.filter(function (prefix) {
                var netmask = prefix.ip_prefix.split('/')[1];
                var netmaskDecimal = (0xffffffff << (32 - netmask)) >>> 0;
                var netmaskLong = ip2long(prefix.ip_prefix.split('/')[0]) & netmaskDecimal;
                var ipLong = ip2long(ip);
                return (ipLong & netmaskDecimal) == netmaskLong;
            });

            if (matchingPrefixes.length > 0) {
                // If the prefix is found, show the service, region and IP prefix
                var chosen_keys = ['service', 'region', 'ip_prefix'];
                var table_header = "<tr>";
                for (const key of chosen_keys) {
                    table_header += "<th scope=\"col\">" + key + "</th>"
                }
                table_header += "</tr>"
                document.getElementById('results-table-header').innerHTML = table_header;

                var i;
                var table_body_rows = "";
                for (i = 0; i < matchingPrefixes.length; i++) {
                    table_body_rows += "<tr>"
                    for (const key of chosen_keys) {
                        table_body_rows += "<td>" + matchingPrefixes[i][key] + "</td>"
                    }
                    table_body_rows += "</tr>"
                }
                with (document.getElementById('results-table-body')) {
                    innerHTML = table_body_rows
                }
                document.getElementById('results-table').hidden = false
            } else {
                // If the prefix is not found, show an appropriate message
                with (document.getElementById('error-alert')) {
                    innerHTML = "IP address not found in AWS CIDR ranges."
                    hidden = false
                }
            }
        });
}

function getInput() {
    var ip = document.getElementById('ip');
    ip.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("submit").click();
        }
    });
}

getInput();

// Listen for form submit and run checkIp function
document.getElementById('submit').addEventListener('click', function (e) {
    e.preventDefault();
    checkIp(document.getElementById('ip').value);
}
);