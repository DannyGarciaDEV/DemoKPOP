
function saveChanges() {
    // Get the edited values from the input fields
    var locationValue = document.getElementById("locationInput").value;
    var dateValue = document.getElementById("dateInput").value;
    var startsValue = document.getElementById("startsInput").value;
    var endsValue = document.getElementById("endsInput").value;

    // Create an object with the edited values
    var editedData = {
        location: locationValue,
        date: dateValue,
        starts: startsValue,
        ends: endsValue
    };

    // Send the edited data to the server using the fetch function
    fetch('/api/updateEvent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log(data);
        // Additional logic can be added here, such as displaying a success message or updating the UI
    })
    .catch(error => {
        // Handle any errors that occurred during the request
        console.error('Error:', error);
    });
}function toggleEditMode() {
    var inputFields = document.querySelectorAll("#eventContainer input");
    var saveButton = document.querySelector("button[onclick='saveChanges()']");

    if (inputFields[0].disabled) {
        // Enable the input fields
        inputFields.forEach(function (input) {
            input.disabled = false;
        });

        // Enable the save button
        saveButton.disabled = false;
    } else {
        // Disable the input fields
        inputFields.forEach(function (input) {
            input.disabled = true;
        });

        // Disable the save button
        saveButton.disabled = true;
    }
}

function toggleFrames() {
    var videoFrame = document.getElementById("videoFrame");
    var playlistFrame = document.getElementById("playlistFrame");
    var mapImage = document.getElementById("mapImage");

    if (videoFrame.style.display === "none") {
        videoFrame.style.display = "block";
        playlistFrame.style.display = "none";
        mapImage.style.display = "block";
    } else {
        videoFrame.style.display = "none";
        playlistFrame.style.display = "block";
        mapImage.style.display = "none";
    }
}





