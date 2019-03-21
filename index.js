import {makeHttpRequest} from './helper.js';



getCSVDataFromISBN(9780374533557)
.then(csvData => {
    console.log(csvData);
})




async function getCSVDataFromISBN(isbn) {

    // Get the book info in JSON format from the Open Library API
    const openLibraryData = await getOpenLibraryData(isbn); 

    // These are the columns we'll have in our CSV record
    const csvFields = [
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

    // Build an exportData object containing the data we want in the CSV field
    // The object's properties map to the columns in the CSV record we'll create
    const exportData = buildExportData(openLibraryData);

    // build an array with the data by mapping the field names to the exportData object
    const csvData = csvFields.map(fieldName => exportData[fieldName])

    // Return the CSV file
    return Papa.unparse({
        "fields": csvFields,
        "data": csvData
    });

}


function buildExportData(data) {
    let exportData = {};

    const metadata = data[Object.keys(data)[0]];
    
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


async function getOpenLibraryData(isbn) {
    const response = await makeHttpRequest(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,'GET')

    try {
        return JSON.parse(response);
    }
    catch(e) {
        throw("Unable to get data")
    }

}

