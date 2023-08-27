const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');

let firNum = 240; // Starting FIR number
const maxFirNum = 240; // Maximum FIR number
const requestDelay = 4000;

function downloadPdf(pdfUrl, filename) {
  request.get({ url: pdfUrl, encoding: null }, function (error, response, body) {
    if (error) throw new Error(error);

    fs.writeFile(filename, body, 'binary', function (err) {
      if (err) throw err;
      console.log(`PDF downloaded as ${filename}`);
      if (firNum < maxFirNum) {
        firNum++;
        setTimeout(performRequest, requestDelay);
      }
    });
  });
}

function performRequest() {
  const options = {
    method: 'POST',
    url: 'https://ksp.karnataka.gov.in/fir_search.php',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8,kn;q=0.7',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'cegkar=eyJpdiI6IkcyV3lycElYRjZrUGUzcG5ld0lFY2c9PSIsInZhbHVlIjoiVWJZckhSOFFiZmlHcHk0aVNVbFhIdVNoOU1KMHRja0pCSms2OUZXRVR5VnJsVlBpVkRJWENIWW5zVVp2cXBYSiIsIm1hYyI6ImIwMmNhNjliNTI3YzViYzVlYjliZTdmMTcyZDg0ZjQ3OGJlNTlkYjE0OTU2Y2ExYTk3ZTBiMDFkNWMyOTgxOWMifQ%3D%3D',
      'DNT': '1',
      'Origin': 'https://ksp.karnataka.gov.in',
      'Referer': 'https://ksp.karnataka.gov.in/firsearch/en?msg=0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-gpc': '1'
    },
    form: {
      district_id: '1',
      ps_id: '1255',
      fir_num: firNum.toString().padStart(4, '0'), // Padded with leading zeros
      year: '2023',
      knen: 'en',
      random_captcha: 'JEPNQ',
      captcha: 'JEPNQ',
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const $ = cheerio.load(body);

    const pdfLinkElement = $('a.btn-primary[href^="fir_new_pdf2"]');
    if (pdfLinkElement.length > 0) {
      const pdfLink = pdfLinkElement.attr('href');
      const pdfUrl = `https://ksp.karnataka.gov.in/${pdfLink}`;
      const pdfFilename = `fir_${firNum}.pdf`;
      
      downloadPdf(pdfUrl, pdfFilename);
    } else {
      console.log('PDF link not found in the response.');
    }
  });
}

performRequest(); // Start the process
