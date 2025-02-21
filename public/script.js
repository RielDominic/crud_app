document.addEventListener('DOMContentLoaded', () => {
    loadStudents();

    // Add event listener for the toggle button
    const toggleButton = document.getElementById('toggle-student-list');
    const studentListContainer = document.getElementById('student-list-container');

    toggleButton.addEventListener('click', () => {
        if (studentListContainer.style.display === 'none') {
            studentListContainer.style.display = 'block';
            toggleButton.textContent = 'Hide Student List';
        } else {
            studentListContainer.style.display = 'none';
            toggleButton.textContent = 'Show Student List';
        }
    });
});

document.getElementById('student-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentNumber = document.getElementById('studentNumber').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const genderElement = document.querySelector('input[name="gender"]:checked');
    const gender = genderElement ? genderElement.value : ''; // Prevents undefined issue

    const contactNumber = document.getElementById('contactNumber').value;
    const address = document.getElementById('address').value;
    const photo = document.getElementById('photo').files[0];

    // Debugging logs to verify data before submission
    console.log("Student Number:", studentNumber);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Gender:", gender);
    console.log("Contact Number:", contactNumber);
    console.log("Address:", address);
    console.log("Photo:", photo ? photo.name : "No file selected");

    const formData = new FormData();
    formData.append('studentNumber', studentNumber);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('gender', gender);
    formData.append('contactNumber', contactNumber);
    formData.append('address', address);
    formData.append('photo', photo);

    try {
        const response = await fetch('/students', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('student-form').reset();
            loadStudents();
        } else {
            console.error("Failed to submit student data.");
        }
    } catch (error) {
        console.error("Error submitting student data:", error);
    }
});

// Function to load students from the database
async function loadStudents() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }
        const students = await response.json();
        const studentList = document.getElementById('student-list');

        // Clear existing rows
        studentList.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentNumber}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.gender}</td>
                <td>${student.contactNumber}</td>
                <td>${student.address}</td>
                <td><img src="${student.photo}" width="80" height="80" style="border-radius: 5px;"></td>
                <td>
                    <button onclick="editStudent('${student._id}', '${student.studentNumber}', '${student.name}', '${student.email}', '${student.gender}', '${student.contactNumber}', '${student.address}', '${student.photo}')">Edit</button>
                    <button onclick="deleteStudent('${student._id}')">Delete</button>
                </td>
            `;
            studentList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading students:", error);
    }
}

// Function to delete a student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const response = await fetch(`/students/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadStudents();
            } else {
                console.error("Failed to delete student.");
            }
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    }
}

// Function to edit a student
function editStudent(id, studentNumber, name, email, gender, contactNumber, address, photo) {
    document.getElementById('studentNumber').value = studentNumber;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;

    // Ensure gender is properly checked
    if (gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }

    document.getElementById('contactNumber').value = contactNumber;
    document.getElementById('address').value = address;

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update Student';
    updateButton.type = 'button'; // Ensure the button type is set to button
    updateButton.onclick = async () => {
        const updatedFormData = new FormData();
        updatedFormData.append('studentNumber', document.getElementById('studentNumber').value);
        updatedFormData.append('name', document.getElementById('name').value);
        updatedFormData.append('email', document.getElementById('email').value);
        updatedFormData.append('gender', document.querySelector('input[name="gender"]:checked').value);
        updatedFormData.append('contactNumber', document.getElementById('contactNumber').value);
        updatedFormData.append('address', document.getElementById('address').value);
        updatedFormData.append('photo', document.getElementById('photo').files[0]);

        try {
            const response = await fetch(`/students/${id}`, {
                method: 'PUT',
                body: updatedFormData
            });

            if (response.ok) {
                document.getElementById('student-form').reset();
                updateButton.remove();
                loadStudents();
            } else {
                console.error("Failed to update student data.");
            }
        } catch (error) {
            console.error("Error updating student data:", error);
        }
    };
    
    // Remove any existing update buttons before appending
    const form = document.getElementById('student-form');
    const existingUpdateButton = form.querySelector('button[type="button"]');
    if (existingUpdateButton) existingUpdateButton.remove();
    
    form.appendChild(updateButton);
}