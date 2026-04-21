const loginData = {
    email: "test@example.com",
    password: "password123"
};

fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
})
    .then(res => res.json())
    .then(data => console.log('Login response:', JSON.stringify(data, null, 2)))
    .catch(err => console.error('Error:', err));
