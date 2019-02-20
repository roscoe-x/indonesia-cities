var fs = require('fs');

exports.dropDown = function () {

    //fs.readFile('IndonesiaProvinces.txt', 'utf8', function (err, data) {
        //if (err) throw err;

        /*var str1 = data.split(",");

        var firstWords = [];
        for (var i=0;i<str1.length;i++)
        {
            var words = str1[i].split("\'");
            firstWords.push(words[1]);
        }*/
        firstWords = [ "Aceh",
        "Sumatera Utara",
        "Sumatera Barat",
        "Riau",
        "Kepulauan Riau",
        "Jambi",
        "Sumatera Selatan",
        "Kepulauan Bangka Belitung",
        "Bengkulu",
        "Lampung",
        "DKI Jakarta",
        "Banten",
        "Jawa Barat",
        "Jawa Tengah",
        "DI Yogyakarta",
        "Jawa Timur",
        "Bali",
        "Nusa Tenggara Barat",
        "Nusa Tenggara Timur",
        "Kalimantan Barat",
        "Kalimantan Tengah",
        "Kalimantan Selatan",
        "Kalimantan Timur",
        "Kalimantan Utara",
        "Sulawesi Utara",
        "Gorontalo",
        "Sulawesi Tengah",
        "Sulawesi Barat",
        "Sulawesi Selatan",
        "Sulawesi Tenggara",
        "Maluku",
        "Maluku Utara",
        "Papua Barat",
        "Papua" ]

        var html=''
        html+="<select name='province'>"
        for (i=0; i<firstWords.length; i++) {
            html += `<option value='${firstWords[i]}'>${firstWords[i]}</option>`
        }
        html += `</select>`
        //console.log(html)
        return html;
    //});
    //return Date();
}; 