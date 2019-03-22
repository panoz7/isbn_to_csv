import {makeHttpRequest, downloadFile} from './helper.js';

// Attach an event listener to the generate CSV button
document.getElementById('generateCSV').addEventListener('click', async (e) => {
    
    // Grab the ISBN string and remove any hyphens
    let isbnString = document.getElementById('isbn').value;
    isbnString = isbnString.replace("-","");

    // Extract the individual ISBNs
    let isbns = [];
    let number = /\b\d+\b/g;
    let match;
    while (match = number.exec(isbnString)) {
        isbns.push(match[0]);
    }
    
    try {
        // Build the CSV Data
        const csvData = await getCSVDataFromISBNs(isbns);
        // Download the file
        downloadFile(`${isbn}.csv`,csvData)
    }
    catch(e) {
        alert("Unable to fetch data. Please double check the ISBN")
    }


})


async function getCSVDataFromISBNs(isbns) {

    // These are the columns we'll have in our CSV record
    const csvFields = [
        'isbn',
        'title',
        'publisher',
        'publish_date',
        'page_count',
        'author_1',
        'author_2',
        'author_3',
        'subject_1',
        'subject_2',
        'subject_3',
        'subject_4',
        'subject_5'
    ]
        
    // Get the book info in JSON format from the Open Library API
    const openLibraryData = await getOpenLibraryData(isbns);
    console.log(openLibraryData);

    // Build out the data rows by iterating through the ISBNs
    const csvData = isbns.map(isbn => {
        // Grab the isbn's metadata from the open library api data
        let metadata = openLibraryData[`ISBN:${isbn}`];

        // If there was metadata
        if (metadata) {
            // Build an exportData object containing the data we want in the CSV field
            // The object's properties map to the columns in the CSV record we'll create
            const exportData = buildExportData(isbn, metadata);
            
            // build an array with the data by mapping the field names to the exportData object
            return csvFields.map(fieldName => exportData[fieldName]);
        }

        // Otherwise just return an array with the ISBN
        return [isbn];
    })

    // Return the CSV file
    return Papa.unparse({
        "fields": csvFields,
        "data": csvData
    });

}


function buildExportData(isbn, metadata) {
    let exportData = {};

    // ISBN
    exportData.isbn = isbn;
    
    // Title
    exportData.title = metadata.title;

    // Number of pages
    exportData.page_count = metadata.pagination;

    // Publish Data
    exportData.publish_date = metadata.publish_date;

    // Publisher
    try {
        exportData.publisher = metadata.publishers[0].name;
    }
    catch(e) {}

    // Authors (maximum of 3)
    for (let i = 0; i < metadata.authors.length && i < 3; i++) {
        exportData[`author_${i+1}`] = metadata.authors[i].name;
    }

    // Subjects (maximum of 5)
    for (let i = 0; i < metadata.subjects.length && i < 5; i++) {
        exportData[`subject_${i+1}`] = metadata.subjects[i].name;
    }

    return exportData;
}


async function getOpenLibraryData(isbns) {

    const isbnParams = isbns.map(isbn => `ISBN:${isbn}`).join(",")
    
    const response = await makeHttpRequest(`https://openlibrary.org/api/books?bibkeys=${isbnParams}&jscmd=data&format=json`,'GET')

    try {
        return JSON.parse(response);
    }
    catch(e) {
        throw("Unable to get data")
    }

}

