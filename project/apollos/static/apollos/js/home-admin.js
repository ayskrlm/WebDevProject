function togglePanelContent(contentId, clickedButton) {
    // Hide all content panels
    const panels = document.querySelectorAll('.content-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
        // Set the background color of the user circle dynamically
        const userCircle = document.querySelector('.user-circle');
        const color = userCircle.getAttribute('data-color');
        userCircle.style.backgroundColor = color;
    });

    // Show the selected content panel
    const contentPanel = document.getElementById(contentId);
    if (contentPanel) {
        contentPanel.style.display = 'block';
    }

    // Remove the highlight class from all panel items
    const panelItems = document.querySelectorAll('.panel-item');
    panelItems.forEach(item => {
        item.classList.remove('highlighted');
    });

    // Add the highlight class to the clicked button
    clickedButton.classList.add('highlighted');
}

// Initially show the Dashboard content when the page loads
document.addEventListener("DOMContentLoaded", function() {
    togglePanelContent('dashboard', document.querySelector('.panel-item'));
});

// Toggle the side panel visibility
document.getElementById('toggle-button').addEventListener('click', function() {
    const sidePanel = document.getElementById('side-panel');
    sidePanel.classList.toggle('open'); // Toggle the 'open' class to animate the panel
    sidePanel.classList.toggle('collapsed'); // Toggle the 'collapsed' state
});





document.addEventListener('DOMContentLoaded', function () {
const addTitleForm = document.getElementById('add-title-form');
const titleListTable = document.getElementById('title-list-table').getElementsByTagName('tbody')[0]; // Get tbody of the table
const searchInput = document.getElementById('search-input'); // Search input field
const bookTitleInput = document.getElementById('book-title');
const subtitleInput = document.getElementById('subtitle');
const genreInput = document.getElementById('genre');
const publisherInput = document.getElementById('publisher');
const publishedDateInput = document.getElementById('published_date');
const volumeInput = document.getElementById('volume');
const descriptionInput = document.getElementById('description');
const authorsInput = document.getElementById('authors');
const pagecountInput = document.getElementById('page_count');
const statusInput = document.getElementById('status');
const sublocationInput = document.getElementById('sub_location');
const numOfCopiesInput = document.getElementById('num_of_copies');
const vendorInput = document.getElementById('vendor');
const startingBarcodeInput = document.getElementById('starting_barcode');
const fundingSourceInput = document.getElementById('funding_source');
const codeNumberInput = document.getElementById('code_number');
const materialTypeInput = document.getElementById('material_type');
const noteInput = document.getElementById('note');
const dateAcquiredInput = document.getElementById('date_acquired');
const purchasePriceInput = document.getElementById('purchase_price');

const attachImage = document.getElementById('attach-image');
const attachFile = document.getElementById('attach-file');

const itemsPerPageSelect = document.getElementById('items-per-page');
const pageInfo = document.getElementById('page-info');
const pageNumberDisplay = document.getElementById('page-number');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const selectAllCheckbox = document.getElementById('select-all');
const deleteButton = document.getElementById('delete-button');
const cancelDeleteButton = document.getElementById('cancel-delete');        
const confirmationModal = document.getElementById('confirmation-modal');
const confirmDeleteButton = document.getElementById('confirm-delete');

const successModal = document.getElementById('success-modal');
const closeSuccessModalButton = document.getElementById('close-success-modal');

let selectedBooks = [];    
let titles = [];
let currentPage = 1;
let itemsPerPage = 5;
let searchTerm = '';  // Store search term

// Function to fetch titles and populate the title list
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
function fetchTitles() {
    console.log("Fetching titles..."); // Debugging line to check if the function is triggered
    fetch("/get-titles/")  // Correct endpoint for fetching titles
        .then(response => response.json())
        .then(data => {
            console.log("Data fetched:", data);  // Log the fetched data for debugging
            if (data.titles) {
                titles = data.titles;
                renderTable();
                updatePagination();
            } else {
                console.error('No titles found in the response');
            }
        })
        .catch(error => console.error('Error fetching titles:', error));
}

// Function to render the table with pagination and search
function renderTable() {
    console.log("Rendering table..."); // Debugging line to ensure renderTable is being called

    // Convert search term to lowercase for case-insensitive search
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Sort titles by date_acquired in descending order (most recent first)
    const sortedTitles = titles.sort((a, b) => {
        const dateA = new Date(a.date_acquired);
        const dateB = new Date(b.date_acquired);
        return dateB - dateA; // Descending order
    });

    // Filter titles based on name, author, standard number, or status
    const filteredTitles = sortedTitles.filter(title => {
        const nameMatch = title.name.toLowerCase().includes(lowerSearchTerm);
        const authorMatch = title.authors && title.authors.toLowerCase().includes(lowerSearchTerm);
        const standardNumberMatch = title.standard_numbers && title.standard_numbers.toLowerCase().includes(lowerSearchTerm);
        const statusMatch = title.status && title.status.toLowerCase().includes(lowerSearchTerm);

        return nameMatch || authorMatch || standardNumberMatch || statusMatch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTitles.length);
    const titlesToRender = filteredTitles.slice(startIndex, endIndex);

    titleListTable.innerHTML = ''; // Clear current table body

    if (titlesToRender.length === 0) {
        titleListTable.innerHTML = '<tr><td colspan="7">No books found.</td></tr>'; // Update colspan to match number of columns
    }

    titlesToRender.forEach(title => {
        const tr = document.createElement('tr');

        // Checkbox Column
        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('title-checkbox');
        checkbox.dataset.standardNumber = title.standard_numbers; // Store the standard number in data attribute
        checkbox.value = title.id; // Assuming `title.id` is the unique identifier for the book
        checkbox.addEventListener('change', function () {
            // Log the standard number when checkbox is selected/deselected
            const standardNumber = checkbox.dataset.standardNumber;
            console.log(`Checkbox for Standard Number: ${standardNumber} is ${checkbox.checked ? 'checked' : 'unchecked'}`);
        });
        checkboxTd.appendChild(checkbox);
        tr.appendChild(checkboxTd);

        // Image Column
        const imgTd = document.createElement('td');
        if (title.attach_image) {
            const img = document.createElement('img');
            img.src = title.attach_image;
            img.alt = title.name;
            img.width = 100;
            imgTd.appendChild(img);
        } else {
            imgTd.textContent = 'No image available';
        }
        tr.appendChild(imgTd);

        // Name Column
        const nameTd = document.createElement('td');
        const titleText = document.createElement('strong');
        titleText.textContent = title.name;
        nameTd.appendChild(titleText);
        tr.appendChild(nameTd);

        // Standard Numbers Column
        const standardNumbersTd = document.createElement('td');
        standardNumbersTd.textContent = title.standard_numbers || 'N/A';
        tr.appendChild(standardNumbersTd);

        // Author Column
        const authorTd = document.createElement('td');
        authorTd.textContent = title.authors || 'N/A';
        tr.appendChild(authorTd);

        // Date Added Column
        const dateAddedTd = document.createElement('td');
        dateAddedTd.textContent = title.date_acquired || 'N/A';
        tr.appendChild(dateAddedTd);

        // Status Column
        const statusTd = document.createElement('td');
        statusTd.textContent = title.status || 'N/A';
        tr.appendChild(statusTd);

        // Append the row to the table
        titleListTable.appendChild(tr);
    });



    // Update page info
    pageInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${filteredTitles.length} results`;
    pageNumberDisplay.textContent = `${currentPage}`;
}

// Function to update pagination controls
function updatePagination() {
    const filteredTitles = titles.filter(title => title.name.toLowerCase().includes(searchTerm.toLowerCase()));
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * itemsPerPage >= filteredTitles.length;
}

// Event listener for pagination buttons
prevPageButton.addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePagination();
    }
});

nextPageButton.addEventListener('click', function() {
    const filteredTitles = titles.filter(title => title.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (currentPage * itemsPerPage < filteredTitles.length) {
        currentPage++;
        renderTable();
        updatePagination();
    }
});

// Event listener for items per page dropdown
itemsPerPageSelect.addEventListener('change', function() {
    itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
    currentPage = 1; // Reset to the first page
    renderTable();
    updatePagination();
});

// Event listener for search input
searchInput.addEventListener('input', function() {
    searchTerm = searchInput.value;  // Store the search term
    currentPage = 1;  // Reset to the first page on search
    renderTable();
    updatePagination();
});

// Event listener for select-all checkbox
selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.title-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
});

// Event listener for delete button
deleteButton.addEventListener('click', function () {
    // Get selected books' standard numbers
    selectedStandardNumbers = getSelectedStandardNumbers();

    if (selectedStandardNumbers.length === 0) {
        alert("Please select at least one book to delete.");
        return;
    }

    // Show the confirmation modal
    confirmationModal.style.display = 'flex';
});

// Event listener for confirm delete button
confirmDeleteButton.addEventListener('click', function () {
    // Prepare data for the POST request
    const requestData = { standard_numbers: selectedStandardNumbers };

    // Send the request to delete books
    fetch(deletetitle, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value, // CSRF token if needed
        },
        body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
        
            // Optionally, update the table or reload the data
            fetchTitles();  // Refetch titles to update the UI
        } else {
            alert(data.error || "An error occurred while deleting the books.");
        }
    })
    .catch(error => {
        console.error('Error deleting books:', error);
        alert('An error occurred while deleting the books.');
    });

    // Close the modal after confirming
    confirmationModal.style.display = 'none';
});

// Event listener for cancel delete button
cancelDeleteButton.addEventListener('click', function () {
    // Close the modal if the user cancels
    confirmationModal.style.display = 'none';
});

// Helper function to get selected standard numbers from the table
function getSelectedStandardNumbers() {
    const selectedCheckboxes = document.querySelectorAll('.title-checkbox:checked');
    return Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.standardNumber);
}

// Initially fetch titles
fetchTitles();

fetch(gettrending)
    .then(response => response.json())
    .then(data => {
        const books = data.trending_books;
        const bookListContainer = document.getElementById('book-list-trending');

        if (books.length === 0) {
            bookListContainer.innerHTML = '<p>No trending books available at the moment.</p>';
        } else {
            // Filter books to show only those with a favorite count of 1 or more
            const filteredBooks = books.filter(book => book.favorite_count >= 1);

            if (filteredBooks.length === 0) {
                bookListContainer.innerHTML = '<p>No trending books with 1 or more favorites.</p>';
            } else {
                // Sort the filtered books by favorite_count in descending order
                filteredBooks.sort((a, b) => b.favorite_count - a.favorite_count);

                filteredBooks.forEach(book => {
                    const bookItem = document.createElement('div');
                    bookItem.classList.add('book-item');
                    bookItem.dataset.bookInfo = JSON.stringify(book);

                    const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";

                    const bookImage = document.createElement('img');
                    bookImage.src = book.image_url || fallbackImage;
                    bookImage.alt = book.name;

                    const bookTitle = document.createElement('h3');
                    bookTitle.textContent = book.name;

                    const authors = document.createElement('p');
                    authors.textContent = book.authors || "Unknown Author";
                    authors.style.display = 'none';

                    const standardNumbers = document.createElement('p');
                    standardNumbers.textContent = book.standard_numbers || "No Standard Number";
                    standardNumbers.style.display = 'none';

                    const favoriteCount = document.createElement('p');

                    // Create a heart icon and place the favorite count inside it
                    const heartIcon = document.createElement('span');
                    heartIcon.classList.add('heart-icon');
                    heartIcon.innerHTML = `💙 <span class="favorite-count">${book.favorite_count}</span>`;

                    favoriteCount.appendChild(heartIcon);

                    bookItem.appendChild(bookImage);
                    bookItem.appendChild(bookTitle);
                    bookItem.appendChild(authors);
                    bookItem.appendChild(standardNumbers);
                    bookItem.appendChild(favoriteCount);

                    bookListContainer.appendChild(bookItem);

                    bookItem.addEventListener('click', () => {
                        openModalSavedTrend(book);
                    });
                });
            }
        }
    })
    .catch(error => {
        console.error('Error fetching trending books:', error);
    });




    function openModalSavedTrend(book) {
        console.log("Opening modal with book:", book);

        const modal = document.getElementById('book-modal-trend');
        if (!modal) {
            console.error("Modal element not found");
            return;
        }

        // Ensure the modal elements exist before proceeding
        const modalBookTitle = document.getElementById('modal-book-title-trend');
        const modalBookTitle2 = document.getElementById('modal-book-title-trend2');
        const modalBookImage = document.getElementById('modal-book-image-trend');
        const modalAuthors = document.getElementById('modal-authors-trend');
        const modalGenre = document.getElementById('modal-genre-trend');
        const modalPublishedDate = document.getElementById('modal-published-date-trend');
        const modalPublisher = document.getElementById('modal-publisher-trend');
        const modalPageCount = document.getElementById('modal-page-count-trend');
        const modalMaterialType = document.getElementById('modal-material-type-trend');
        const modalDescription = document.getElementById('modal-description-trend');
        const downloadFileBtn = document.getElementById('download-file-btn-trend');
        const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";

        // Check if modal elements exist
        if (!modalBookTitle || !modalBookTitle2 || !modalBookImage || !modalAuthors || !modalGenre || !modalPublishedDate || !modalPublisher || !modalPageCount || !modalMaterialType || !modalDescription) {
            console.error("One or more modal elements are missing.");
            return;
        }

        // Set modal book details
        modalBookTitle.textContent = book.name || "Unknown Title";
        modalBookTitle2.textContent = book.name || "Unknown Title";
        modalBookImage.src = book.image_url || fallbackImage;

        const authors = Array.isArray(book.authors) ? book.authors : [book.authors || "Unknown"];
        modalAuthors.textContent = authors.join(', ');

        modalGenre.textContent = book.genre || "Unknown Genre";
        modalPublishedDate.textContent = book.published_date || "Unknown Date";
        modalPublisher.textContent = book.publisher || "Unknown Publisher";
        modalPageCount.textContent = book.page_count || "Unknown";
        modalMaterialType.textContent = book.material_type || "Unknown Type";
        modalDescription.textContent = book.description || "No description available.";

        // Handle file download button
        if (book.attach_file) {
            downloadFileBtn.style.display = 'inline-block';
            downloadFileBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = book.attach_file;
                link.download = book.name || 'file';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        } else {
            downloadFileBtn.style.display = 'none';
        }

        // Show the modal
        modal.style.display = 'block';

        // Close modal when clicking on close button or outside the modal
        document.getElementById('close-modal-book-trend').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }





    





// Add title form submit event listener
const standardNumberInput = document.getElementById('standard_numbers');  // Make sure this matches your HTML input ID

// Event listener for form submission
addTitleForm.addEventListener('submit', function (e) {
e.preventDefault();  // Prevent the form from submitting normally

// Collect form values
const bookTitle = bookTitleInput.value.trim();
const standardNumbers = standardNumberInput.value.trim();
const genre = genreInput.value.trim();
const attachImageFile = attachImage.files[0];
const attachFileFile = attachFile.files[0];
const subtitle = subtitleInput.value.trim();
const publisher = publisherInput.value.trim();
const publishedDate = publishedDateInput.value.trim();
const volume = volumeInput.value.trim();
const description = descriptionInput.value.trim();
const authors = authorsInput.value.trim();
const pageCount = pagecountInput.value.trim();
const status = statusInput.value.trim();
const sublocation = sublocationInput.value.trim();
const numOfCopies = numOfCopiesInput.value.trim();
const vendor = vendorInput.value.trim();
const startingBarcode = startingBarcodeInput.value.trim();
const fundingSource = fundingSourceInput.value.trim();
const codeNumber = codeNumberInput.value.trim();
const materialType = materialTypeInput.value.trim();
const note = noteInput.value.trim();
const dateAcquired = dateAcquiredInput.value.trim();
const purchasePrice = purchasePriceInput.value.trim();

if (!bookTitle) {
alert('Please enter a book title.');
return;
}

if (!standardNumbers) {
alert('Please enter a standard number.');
return;
}

// Function to generate a random 6-letter string
// Function to generate a random 6-letter string
function generateRandomString(length) {
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let result = '';
for (let i = 0; i < length; i++) {
result += chars.charAt(Math.floor(Math.random() * chars.length));
}
return result;
}

// Modify the file name with the desired pattern
function modifyFileName(file) {
const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format as YYYYMMDD
const randomString = generateRandomString(6); // Generate a random string

// Separate the base file name and extension
const lastDotIndex = file.name.lastIndexOf('.');
const fileNameWithoutExt = file.name.substring(0, lastDotIndex).replace(/\s+/g, '_'); // Replace spaces and trim the extension
const fileExtension = file.name.substring(lastDotIndex); // Get the file extension, including the dot

// Construct the new file name
const newFileName = `${fileNameWithoutExt}#${date}${randomString}${fileExtension}`;

// Create a new file object with the modified name
const newFile = new File([file], newFileName, { type: file.type });
return newFile;
}



// Prepare the FormData object to send both text and files
const formData = new FormData();
formData.append('book_title', bookTitle);
formData.append('standard_numbers', standardNumbers);
formData.append('genre', genre);
formData.append('subtitle', subtitle);
formData.append('publisher', publisher);
formData.append('published_date', publishedDate);
formData.append('volume', volume);
formData.append('description', description);
formData.append('authors', authors);
formData.append('page_count', pageCount);
formData.append('status', status);
formData.append('sub_location', sublocation);
formData.append('num_of_copies', numOfCopies);
formData.append('vendor', vendor);
formData.append('starting_barcode', startingBarcode);
formData.append('funding_source', fundingSource);
formData.append('code_number', codeNumber);
formData.append('material_type', materialType);
formData.append('note', note);
formData.append('date_acquired', dateAcquired);
formData.append('purchase_price', purchasePrice);

if (attachImageFile) {
const modifiedImageFile = modifyFileName(attachImageFile);
formData.append('attach_image', modifiedImageFile);
}

if (attachFileFile) {
const modifiedFileFile = modifyFileName(attachFileFile);
formData.append('attach_file', modifiedFileFile);
}

// Assuming the table body element is the one you want to modify
const titleListTableBody = document.querySelector('#title-list-table tbody');  // Target the tbody of the table

fetch(addtitle, {
    method: "POST",
    headers: {
        "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
    },
        body: formData  // Send FormData directly (no need for JSON.stringify)
        })
        .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

return response.json();  // Parse the response as JSON if it's okay
})
    .then(data => {
    console.log('Server response:', data);  // Log the server response to debug

    if (data.error) {
        alert(data.error);
        return;
    }

if (data.titles) {
    titleListTableBody.innerHTML = '';  // Clear the current table body

    // Add the updated titles to the table
    data.titles.forEach(title => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="select-item"></td>
            <td><img src="${title.image_url}" alt="Image" class="title-image"></td>
            <td>${title.name}</td>
            <td>${title.standard_numbers}</td>
            <td>${title.authors}</td>
            <td>${title.date_acquired}</td>
        `;
        titleListTableBody.appendChild(tr);  // Append the new row to the table body
    });

    successModal.style.display = 'flex';  // Show the success modal
    addTitleForm.reset();
} else if (data.success) {
    alert("Book title added successfully!");
}
})
.catch(error => {
console.error('Error adding title:', error);

if (error.message.includes('SyntaxError')) {
    alert("The server returned an unexpected response. Please check if you're logged in or check the server logs.");
} else {
    alert("An error occurred while adding the title.");
}
});
});



    // Event listener for closing the success modal
    closeSuccessModalButton.addEventListener('click', function () {
        successModal.style.display = 'none'; // Close the success modal
    });

    // Event listener for the "Title" button to load titles when clicked
    const titleButton = document.getElementById('title-button');
    titleButton.addEventListener('click', function () {
        fetchTitles();
    });

    // Initially populate the title list if the "Title" panel is already visible
    const titlePanel = document.getElementById('title');
    if (titlePanel.style.display !== 'none') {
        fetchTitles();  // Populate titles if the panel is already open on page load
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const showFormBtn = document.getElementById('show-form-btn');
    const addTitleForm = document.getElementById('add-title-form');
    const titleList = document.getElementById('title-list');

    // Toggle the visibility of the form and title list when the "Show Form" button is clicked
    showFormBtn.addEventListener('click', function () {
        if (addTitleForm.style.display === "none" || addTitleForm.style.display === "") {
            // Hide the title list and show the form
            titleList.style.display = "none";
            addTitleForm.style.display = "block";
            showFormBtn.textContent = "Show Titles";  // Change button text
        } else {
            // Hide the form and show the title list
            addTitleForm.style.display = "none";
            titleList.style.display = "block";
            showFormBtn.textContent = "Add Title";  // Change button text
        }
    });
});

// Handle the file input for Attach File section
const fileInput = document.getElementById('attach-file');
const filePreview = document.getElementById('file-preview');
fileInput.addEventListener('change', function() {
    handleFileSelect(fileInput, filePreview);
});

// Handle the image input for Attach Image section
const imageInput = document.getElementById('attach-image');
const imagePreview = document.getElementById('image-preview');
imageInput.addEventListener('change', function() {
    handleFileSelect(imageInput, imagePreview);
});

// Handle the file input for Edit Attach File section
const editFileInput = document.getElementById('edit-attach-file');
const editFilePreview = document.getElementById('edit-file-preview');
editFileInput.addEventListener('change', function() {
    handleFileSelect(editFileInput, editFilePreview);
});

// Handle the image input for Edit Attach Image section
const editImageInput = document.getElementById('edit-attach-image');
const editImagePreview = document.getElementById('edit-image-preview');
editImageInput.addEventListener('change', function() {
    handleFileSelect(editImageInput, editImagePreview);
});

// Function to handle file/image selection and preview
function handleFileSelect(input, previewElement) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            previewElement.style.display = 'block';
            if (file.type.startsWith('image/')) {
                previewElement.innerHTML = `<img src="${event.target.result}" alt="${file.name}">`;
            } else {
                previewElement.innerHTML = `<p>${file.name}</p>`;
            }
        };
        reader.readAsDataURL(file);
    }
}



// Drag & Drop functionality for Attach File section
const fileUploadArea = document.getElementById('file-upload-area');
fileUploadArea.addEventListener('dragover', function(event) {
    event.preventDefault();
    fileUploadArea.classList.add('dragging');
});

fileUploadArea.addEventListener('dragleave', function() {
    event.preventDefault();
    fileUploadArea.classList.remove('dragging');
});

fileUploadArea.addEventListener('drop', function(event) {
    event.preventDefault();
    fileUploadArea.classList.remove('dragging');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        fileInput.files = files;
        handleFileSelect(fileInput, filePreview);
    } else {
        alert("No files were dropped.");
    }
});

// Drag & Drop functionality for Attach Image section
const imageUploadArea = document.getElementById('image-upload-area');
imageUploadArea.addEventListener('dragover', function(event) {
    event.preventDefault();
    imageUploadArea.classList.add('dragging');
});

imageUploadArea.addEventListener('dragleave', function() {
    imageUploadArea.classList.remove('dragging');
});

imageUploadArea.addEventListener('drop', function(event) {
    event.preventDefault();
    imageUploadArea.classList.remove('dragging');
    const file = event.dataTransfer.files[0];
    if (file) {
        imageInput.files = event.dataTransfer.files;
        handleFileSelect(imageInput, imagePreview);
    }
});

// Drag & Drop functionality for Edit Attach File section
const editFileUploadArea = document.getElementById('edit-file-upload-area');
editFileUploadArea.addEventListener('dragover', function(event) {
    event.preventDefault();
    editFileUploadArea.classList.add('dragging');
});

editFileUploadArea.addEventListener('dragleave', function() {
    editFileUploadArea.classList.remove('dragging');
});

editFileUploadArea.addEventListener('drop', function(event) {
    event.preventDefault();
    editFileUploadArea.classList.remove('dragging');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        editFileInput.files = files;
        handleFileSelect(editFileInput, editFilePreview);
    } else {
        alert("No files were dropped.");
    }
});

// Drag & Drop functionality for Edit Attach Image section
const editImageUploadArea = document.getElementById('edit-image-upload-area');
editImageUploadArea.addEventListener('dragover', function(event) {
    event.preventDefault();
    editImageUploadArea.classList.add('dragging');
});

editImageUploadArea.addEventListener('dragleave', function() {
    editImageUploadArea.classList.remove('dragging');
});

editImageUploadArea.addEventListener('drop', function(event) {
    event.preventDefault();
    editImageUploadArea.classList.remove('dragging');
    const file = event.dataTransfer.files[0];
    if (file) {
        editImageInput.files = event.dataTransfer.files;
        handleFileSelect(editImageInput, editImagePreview);
    }
});

// Click the browse link to open the file input for Attach File section
document.querySelectorAll('.browse-link').forEach(function(link) {
    link.addEventListener('click', function() {
        const input = link.closest('.file-upload-area').querySelector('input[type="file"]');
        input.click();
    });
});


function cancelAddTitle() {
// Hide the form and show the title list
document.getElementById('add-title-form').style.display = 'none';
document.getElementById('title-list').style.display = 'block';
}

// Example function to show the add-title form
function showAddTitleForm() {
    document.getElementById('add-title-form').style.display = 'block';
    document.getElementById('title-list').style.display = 'none';
}


document.getElementById('show-form-btn').addEventListener('click', function() {
    // Get the current text content of the h2
    const currentText = document.querySelector('#title h2').textContent;
    
    // Toggle between "Title List" and "Show List"
    if (currentText === 'Title List') {
        document.querySelector('#title h2').textContent = 'Add Title';
    } else {
        document.querySelector('#title h2').textContent = 'Title List';
    }
});





// Event listener for the edit button
document.getElementById('edit-button').addEventListener('click', function() {
    const selectedStandardNumbers = getSelectedStandardNumbers(); // Implement this as needed
    if (selectedStandardNumbers.length !== 1) {
        alert("Please select exactly one book to edit.");
        return;
    }

    // Fetch the book data
    fetch(`/get-book-data/${selectedStandardNumbers[0]}/`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const bookData = data.book;

                // Check if each element exists before trying to set its value
                console.log("Populating form fields with book data...");
                
                // Pre-fill the form fields with the book data
                const bookTitleField = document.getElementById('edit-book-title');
                const standardNumbersField = document.getElementById('edit-standard-numbers');
                if (bookTitleField && standardNumbersField) {
                    bookTitleField.value = bookData.name;
                    standardNumbersField.value = bookData.standard_numbers;
                } else {
                    console.error("Book Title or Standard Numbers field not found.");
                }

                const subtitleField = document.getElementById('edit-subtitle');
                if (subtitleField) subtitleField.value = bookData.subtitle || '';
                
                const genreField = document.getElementById('edit-genre');
                if (genreField) genreField.value = bookData.genre || '';
                
                const volumeField = document.getElementById('edit-volume');
                if (volumeField) volumeField.value = bookData.volume || '';
                
                const authorsField = document.getElementById('edit-authors');
                if (authorsField) authorsField.value = bookData.authors || '';

                const publisherField = document.getElementById('edit-publisher');
                if (publisherField) publisherField.value = bookData.publisher || '';

                const publishedDateField = document.getElementById('edit-published_date');
                if (publishedDateField) publishedDateField.value = bookData.published_date || '';
                
                const descriptionField = document.getElementById('edit-description');
                if (descriptionField) descriptionField.value = bookData.description || '';
                
                const pageCountField = document.getElementById('edit-page_count');
                if (pageCountField) pageCountField.value = bookData.page_count || '';

                const statusField = document.getElementById('edit-status');
                if (statusField) statusField.value = bookData.status || 'active';

                const subLocationField = document.getElementById('edit-sub_location');
                if (subLocationField) subLocationField.value = bookData.sub_location || 'circulation';

                const numCopiesField = document.getElementById('edit-num_of_copies');
                if (numCopiesField) numCopiesField.value = bookData.num_of_copies || '';
                
                const vendorField = document.getElementById('edit-vendor');
                if (vendorField) vendorField.value = bookData.vendor || '';
                
                const startingBarcodeField = document.getElementById('edit-starting_barcode');
                if (startingBarcodeField) startingBarcodeField.value = bookData.starting_barcode || '';
                
                const fundingSourceField = document.getElementById('edit-funding_source');
                if (fundingSourceField) fundingSourceField.value = bookData.funding_source || '';
                
                const codeNumberField = document.getElementById('edit-code_number');
                if (codeNumberField) codeNumberField.value = bookData.code_number || '';
                
                const materialTypeField = document.getElementById('edit-material_type');
                if (materialTypeField) materialTypeField.value = bookData.material_type || '';
                
                const noteField = document.getElementById('edit-note');
                if (noteField) noteField.value = bookData.note || '';
                
                const dateAcquiredField = document.getElementById('edit-date_acquired');
                if (dateAcquiredField) dateAcquiredField.value = bookData.date_acquired || '';
                
                const purchasePriceField = document.getElementById('edit-purchase_price');
                if (purchasePriceField) purchasePriceField.value = bookData.purchase_price || '';

                // Show the form
                document.getElementById('edit-title-form').style.display = 'block';
            } else {
                alert("Error fetching book data.");
            }
        })
        .catch(error => {
            console.error('Error fetching book data:', error);
            alert('An error occurred while fetching the book data.');
        });
});

document.getElementById('edit-title-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting normally

    const formData = new FormData(this);

    fetch(updatetitle, {
        method: "POST",
        headers: {
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,  // CSRF Token from form
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Book title updated successfully!");

            // Call the function to update the table row with new data
            updateTableRow(data.updatedTitle);  // Make sure this function is defined
        } else {
            alert("Book title updated successfully!");
        }
    })
    .catch(error => {
        console.error('Error updating title:', error);
        alert("An error occurred while updating the title.");
    });
});

async function fetchDashboardData() {
        try {
            const response = await fetch('/dashboard-data/');
            const data = await response.json();

            // Update the HTML elements with the data from the API
            document.getElementById('active-books-count').textContent = data.active_books_count;
            document.getElementById('inactive-books-count').textContent = data.inactive_books_count;
            document.getElementById('user-count').textContent = data.user_count;
            document.getElementById('book-count').textContent = data.book_count;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    }

    // Call the function to fetch the data when the page is loaded
    window.onload = fetchDashboardData;


// Function to close the modal
function cancelEditTitle() {
    // Get the form element by ID
    var form = document.getElementById('edit-title-form');
    
    // Hide the form by setting its display style to 'none'
    form.style.display = 'none';
}


// Helper function to get selected standard numbers from the table
function getSelectedStandardNumbers() {
    const selectedCheckboxes = document.querySelectorAll('.title-checkbox:checked');
    return Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.standardNumber);
}



// Update the table row (implement this function to reflect changes in the UI)
function updateTableRow(updatedTitle) {
    const row = document.querySelector(`tr[data-standard-number="${updatedTitle.standard_numbers}"]`);
    if (row) {
        row.querySelector('.title').textContent = updatedTitle.name;
        row.querySelector('.standard-number').textContent = updatedTitle.standard_numbers;
        row.querySelector('.subtitle').textContent = updatedTitle.subtitle;
        row.querySelector('.genre').textContent = updatedTitle.genre;
        row.querySelector('.volume').textContent = updatedTitle.volume;
        row.querySelector('.authors').textContent = updatedTitle.authors;
        row.querySelector('.publisher').textContent = updatedTitle.publisher;
        row.querySelector('.published_date').textContent = updatedTitle.published_date;
        row.querySelector('.description').textContent = updatedTitle.description;
        row.querySelector('.page_count').textContent = updatedTitle.page_count;
        row.querySelector('.status').textContent = updatedTitle.status;
        row.querySelector('.sub_location').textContent = updatedTitle.sub_location;
        row.querySelector('.num_of_copies').textContent = updatedTitle.num_of_copies;
        row.querySelector('.vendor').textContent = updatedTitle.vendor;
        row.querySelector('.starting_barcode').textContent = updatedTitle.starting_barcode;
        row.querySelector('.funding_source').textContent = updatedTitle.funding_source;
        row.querySelector('.code_number').textContent = updatedTitle.code_number;
        row.querySelector('.material_type').textContent = updatedTitle.material_type;
        row.querySelector('.note').textContent = updatedTitle.note;
        row.querySelector('.date_acquired').textContent = updatedTitle.date_acquired;
        row.querySelector('.purchase_price').textContent = updatedTitle.purchase_price;

        // Update other fields as necessary
    }

    // Initially fetch titles
fetchTitles();
}

// Function to fetch the data from the Django view and update the dashboard
function logoutUseradmin() {
// Perform a logout by submitting a POST request to the Django logout URL
    fetch('/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
        }
    })
    .then(response => {
        if (response.ok) {
            // Redirect to the login page or home page after successful logout
            window.location.href = '/login/';
        } else {
            alert("Logout failed. Please try again.");
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
        alert("Logout failed. Please try again.");
    });
}

function getCookie(name) {
let cookieValue = null;
if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Check if this cookie string begins with the name we want
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
        }
    }
}
return cookieValue;
}    
