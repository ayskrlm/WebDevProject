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


// Fetch books from the API
// Fetch books from the API
fetch('/api/active-books/')
    .then(response => response.json())
    .then(data => {
        const books = data.books;
        const bookListContainer = document.getElementById('book-list');  // Ensure you have an element with id 'book-list'
        const searchBar = document.getElementById('search-bar');  // Get the search bar element

        // Function to display books
        function displayBooks(filteredBooks) {
            bookListContainer.innerHTML = '';  // Clear the book list before displaying new results

            if (filteredBooks.length === 0) {
                // If there are no books, display a message
                bookListContainer.innerHTML = '<p>No books available to read online at the moment.</p>';
            } else {
                // Loop through the books and add them to the page
                filteredBooks.forEach(book => {

                    const bookItem = document.createElement('div');
                    bookItem.classList.add('book-item');
                    bookItem.dataset.bookInfo = JSON.stringify(book);  // Store book data in the div
                    const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";
                    // Create the book content
                    const bookImage = document.createElement('img');
                    // Use a fallback image if no image_url is available
                    bookImage.src = book.image_url || fallbackImage;  // Path to fallback image
                    bookImage.alt = book.name;

                    const bookTitle = document.createElement('h3');
                    bookTitle.textContent = book.name;

                    const bookAuthor = document.createElement('h3');
                    bookAuthor.textContent = book.authors;
                    bookAuthor.style.display = 'none';

                    const bookGenre = document.createElement('h3');
                    bookGenre.textContent = book.genre;
                    bookGenre.style.display = 'none';

                    // Append the elements to the book item
                    bookItem.appendChild(bookImage);
                    bookItem.appendChild(bookTitle);
                    bookItem.appendChild(bookAuthor);
                    bookItem.appendChild(bookGenre);

                    // Append the book item to the list container
                    bookListContainer.appendChild(bookItem);

                    // Add click event to open the modal
                    bookItem.addEventListener('click', () => {
                        openModal(book);
                    });
                });
            }
        }

        // Initial display of all books
        displayBooks(books);

        // Search functionality
        searchBar.addEventListener('input', function() {
            const searchQuery = searchBar.value.toLowerCase();  // Get the search input

            // Filter books based on the search query, including name, authors, and genre
            const filteredBooks = books.filter(book => {
                // Ensure authors is always an array
                const authors = Array.isArray(book.authors) ? book.authors : [book.authors];

                // Check if the search query matches book name, authors, or genre
                return book.name.toLowerCase().includes(searchQuery) || 
                    authors.some(author => author.toLowerCase().includes(searchQuery)) ||
                    book.genre.toLowerCase().includes(searchQuery);  // Include genre in the search
                    book.material_type.toLowerCase().includes(searchQuery);
            });

            // Display the filtered books
            displayBooks(filteredBooks);
        });
    })
    .catch(error => {
        console.error('Error fetching books:', error);
    });


// Function to open the modal and populate it with book data
// Function to open the modal and populate it with book data
function openModal(book) {
    console.log("Opening modal with book:", book); // Debug log to ensure function is called

    const modal = document.getElementById('book-modal');
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    // Modal elements
    const modalBookTitle = document.getElementById('modal-book-title');
    const modalBookTitle2 = document.getElementById('modal-book-title2');
    const modalBookImage = document.getElementById('modal-book-image');
    const modalAuthors = document.getElementById('modal-authors');
    const modalGenre = document.getElementById('modal-genre');
    const modalPublishedDate = document.getElementById('modal-published-date');
    const modalPublisher = document.getElementById('modal-publisher');
    const modalPageCount = document.getElementById('modal-page-count');
    const modalMaterialType = document.getElementById('modal-material-type');
    const modalDescription = document.getElementById('modal-description');
    const downloadFileBtn = document.getElementById('download-file-btn');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn');
    const readNowBtn = document.getElementById('read-now-btn');  // Read Now button
    const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";
    const csrfToken = getCsrfToken();

    // Set modal content
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

    // Configure the download button
    if (book.attach_file) {
        downloadFileBtn.style.display = 'inline-block';
        downloadFileBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = book.attach_file; // File URL
            link.download = book.name || 'file'; // Suggested file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Clean up after triggering download
        };
    } else {
        downloadFileBtn.style.display = 'none';
    }

    // Configure the "Read Now" button
    if (book.attach_file) {
        readNowBtn.style.display = 'inline-block';
        readNowBtn.onclick = () => {
            const popup = window.open(book.attach_file, '_blank', 'width=800,height=900');
            if (!popup) {
                alert('Please allow popups for this site to view the PDF.');
            }
        };
    } else {
        readNowBtn.style.display = 'none';
    }

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            return meta.getAttribute('content');
        }
        console.error("CSRF token not found in meta tag.");
        return null;
    }

    // Handle the "Save to Favorites" button
    saveFavoriteBtn.onclick = () => {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            alert("CSRF token missing. Unable to save the favorite.");
            return;
        }

        if (!book.standard_numbers) {
            alert("Book does not have a standard number.");
            return;
        }

        fetch('/save-favorite/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ standard_numbers: book.standard_numbers }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Book saved to favorites!');
                } else {
                    alert(`${data.error || 'Unknown error'}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    // Show the modal
    modal.style.display = 'block';
}


// Function to close the modal
document.getElementById('close-modal-book').addEventListener('click', () => {
    const modal = document.getElementById('book-modal');
    modal.style.display = 'none';
});

// Close modal if user clicks outside of the modal
window.addEventListener('click', (event) => {
    const modal = document.getElementById('book-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

fetch('/get-trending-books/')
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



fetch('/get-saved-books/')
    .then(response => response.json())
    .then(data => {
        const books = data.saved_books; 
        const bookListContainer = document.getElementById('book-list-fav');

        if (books.length === 0) {
            bookListContainer.innerHTML = '<p>No books available to read online at the moment.</p>';
        } else {
            books.forEach(book => {
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
                authors.textContent = '';

                const standardNumbers = document.createElement('p');
                standardNumbers.textContent = '';

                bookItem.appendChild(bookImage);
                bookItem.appendChild(bookTitle);
                bookItem.appendChild(authors);
                bookItem.appendChild(standardNumbers);

                bookListContainer.appendChild(bookItem);

                bookItem.addEventListener('click', () => {
                    openModalSaved(book);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error fetching books:', error);
    });



function openModalSaved(book) {
    console.log("Opening modal with book:", book);

    const modal = document.getElementById('book-modal-fav');
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    const modalBookTitle = document.getElementById('modal-book-title-fav2');
    const modalBookTitle2 = document.getElementById('modal-book-title-fav');
    const modalBookImage = document.getElementById('modal-book-image-fav');
    const modalAuthors = document.getElementById('modal-authors-fav');
    const modalGenre = document.getElementById('modal-genre-fav');
    const modalPublishedDate = document.getElementById('modal-published-date-fav');
    const modalPublisher = document.getElementById('modal-publisher-fav');
    const modalPageCount = document.getElementById('modal-page-count-fav');
    const modalMaterialType = document.getElementById('modal-material-type-fav');
    const modalDescription = document.getElementById('modal-description-fav');
    const downloadFileBtn = document.getElementById('download-file-btn-fav');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn');
    const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";

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

const removeFavoriteBtn = document.getElementById('remove-favorite-btn');
if (removeFavoriteBtn) {
    removeFavoriteBtn.onclick = () => {
        fetch('/remove-saved-book/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Ensure CSRF token is available
            },
            body: JSON.stringify({ standard_numbers: book.standard_numbers })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Book removed from saved books.');
                    modal.style.display = 'none';
                    window.location.reload();
                } else {
                    alert(data.error || 'Failed to remove the book.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while removing the book.');
            });
    };
}


modal.style.display = 'block';

document.getElementById('close-modal-book-fav').addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
}


function openModalSavedTrend(book) {
    console.log("Opening modal with book:", book);

    const modal = document.getElementById('book-modal-trend2');
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    const modalBookTitle = document.getElementById('modal-book-title-trend22');
    const modalBookTitle2 = document.getElementById('modal-book-title-trend2');
    const modalBookImage = document.getElementById('modal-book-image-trend2');
    const modalAuthors = document.getElementById('modal-authors-trend2');
    const modalGenre = document.getElementById('modal-genre-trend2');
    const modalPublishedDate = document.getElementById('modal-published-date-trend2');
    const modalPublisher = document.getElementById('modal-publisher-trend2');
    const modalPageCount = document.getElementById('modal-page-count-trend2');
    const modalMaterialType = document.getElementById('modal-material-type-trend2');
    const modalDescription = document.getElementById('modal-description-trend2');
    const downloadFileBtntrend = document.getElementById('download-file-btn-trend2');
    const readNowBtn = document.getElementById('read-now-btn-trend2');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn-trend2');
    const fallbackImage = "{% static 'apollos/img/NoImageAvailable.svg' %}";

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

    // Handle the download button visibility and functionality
    if (book.file_url) {
        downloadFileBtntrend.style.display = 'inline-block';
        downloadFileBtntrend.onclick = () => {
            const link = document.createElement('a');
            link.href = book.file_url;  // Make sure this is the correct file URL
            link.download = book.name || 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    } else {
        downloadFileBtntrend.style.display = 'none';
    }

    // Configure the "Read Now" button
    if (book.attach_file) {
        readNowBtn.style.display = 'inline-block';
        readNowBtn.onclick = () => {
            const popup = window.open(book.attach_file, '_blank', 'width=800,height=600');
            if (!popup) {
                alert('Please allow popups for this site to view the PDF.');
            }
        };
    } else {
        readNowBtn.style.display = 'none';
    }

    // CSRF token retrieval function
    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            return meta.getAttribute('content');
        }
        console.error("CSRF token not found in meta tag.");
        return null;
    }

    // Handle the "Save to Favorites" button
    saveFavoriteBtn.onclick = () => {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            alert("CSRF token missing. Unable to save the favorite.");
            return;
        }

        if (!book.standard_numbers) {
            alert("Book does not have a standard number.");
            return;
        }

        fetch('/save-favorite/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ standard_numbers: book.standard_numbers }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Book saved to favorites!');
                } else {
                    alert(`Failed to save book: ${data.error || 'Unknown error'}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
        });
    };

    const removeFavoriteBtn = document.getElementById('remove-favorite-btn');
        if (removeFavoriteBtn) {
            removeFavoriteBtn.onclick = () => {
                fetch('/remove-saved-book/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Ensure CSRF token is available
                    },
                    body: JSON.stringify({ standard_numbers: book.standard_numbers })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Book removed from saved books.');
                            modal.style.display = 'none';
                            window.location.reload();
                        } else {
                            alert(data.error || 'Failed to remove the book.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while removing the book.');
                    });
            };
        }

        modal.style.display = 'block';

        document.getElementById('close-modal-book-trend').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }


function logoutUser() {
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