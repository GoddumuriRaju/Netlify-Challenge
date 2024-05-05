document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', document.getElementById('imageInput').files[0]);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.text();
        alert(result); // Display the server response
    };
});
