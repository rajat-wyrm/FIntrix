import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Lead from './models/Lead.js';

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        let user;
        if (userCount === 0) {
            console.log('No users found. Seeding database with a test user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'user'
            });
            console.log('Test user created: test@example.com / password123');
        } else {
            user = await User.findOne();
        }

        const leadCount = await Lead.countDocuments();
        if (leadCount === 0) {
            console.log('No leads found. Seeding database with sample leads...');
            const sampleLeads = [
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    domain: 'techcorp.com',
                    companyName: 'TechCorp',
                    jobTitle: 'CEO',
                    status: 'new',
                    managementLevel: 'executive',
                    department: 'Executive',
                    industry: 'Technology',
                    location: 'New York',
                    companyLocation: 'New York, NY',
                    companySize: '1000-5000',
                    revenue: '$50M-$100M',
                    skills: 'Leadership, Strategy',
                    addedById: 1
                },
                {
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    domain: 'financeinc.com',
                    companyName: 'FinanceInc',
                    jobTitle: 'CFO',
                    status: 'contacted',
                    managementLevel: 'executive',
                    department: 'Finance',
                    industry: 'Finance',
                    location: 'San Francisco',
                    companyLocation: 'San Francisco, CA',
                    companySize: '500-1000',
                    revenue: '$10M-$50M',
                    skills: 'Finance, Accounting',
                    addedById: 1
                },
                {
                    name: 'Bob Johnson',
                    email: 'bob.johnson@example.com',
                    domain: 'retailco.com',
                    companyName: 'RetailCo',
                    jobTitle: 'Manager',
                    status: 'qualified',
                    managementLevel: 'manager',
                    department: 'Operations',
                    industry: 'Retail',
                    location: 'Chicago',
                    companyLocation: 'Chicago, IL',
                    companySize: '100-500',
                    revenue: '$1M-$10M',
                    skills: 'Operations, Logistics',
                    addedById: 1
                }
            ];

            await Lead.insertMany(sampleLeads);
            console.log('Sample leads created');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

export default seedDatabase;
