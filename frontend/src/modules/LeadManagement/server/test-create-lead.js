const leadData = {
    name: "Test Lead",
    email: "testlead@example.com",
    domain: "example.com",
    addedById: 1,
    jobTitle: "CTO",
    status: "new"
};

fetch('http://localhost:5000/api/leads', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
})
    .then(res => res.json())
    .then(data => console.log('Create lead response:', JSON.stringify(data, null, 2)))
    .catch(err => console.error('Error:', err));
