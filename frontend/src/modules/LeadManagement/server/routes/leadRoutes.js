import express from 'express';
import { findLeads, findLeadById, createLead, updateLead, deleteLead } from './leadService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import stream from 'stream';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const csvStorage = multer.memoryStorage();

const csvUpload = multer({
    storage: csvStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

// GET /api/leads - Get all leads with optional filters
router.get('/', async (req, res) => {
    try {
        const { search, status, type, managementLevel, department, industry, location, companySize, revenue } = req.query;
        const leads = await findLeads({ search, status, type, managementLevel, department, industry, location, companySize, revenue });
        res.json({ leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/leads/:id - Get a single lead by ID
router.get('/:id', async (req, res) => {
    try {
        const lead = await findLeadById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ lead });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/leads - Create a new lead
router.post('/', async (req, res) => {
    try {
        const newLead = await createLead(req.body);
        res.status(201).json({ lead: newLead });
    } catch (error) {
        console.error('Error creating lead:', error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// PUT /api/leads/:id - Update a lead
router.put('/:id', async (req, res) => {
    try {
        const updatedLead = await updateLead(req.params.id, req.body);
        res.json({ lead: updatedLead });
    } catch (error) {
        console.error('Error updating lead:', error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await deleteLead(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/leads/upload-profile-pic - Upload profile picture
router.post('/upload-profile-pic', upload.single('profilePic'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ filePath });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/leads/import - Import leads from CSV file
router.post('/import', csvUpload.single('file'), async (req, res) => {
    try {
        console.log('Import request received');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const leads = [];
        const buffer = req.file.buffer.toString('utf-8');
        console.log('Buffer length:', buffer.length);
        console.log('Buffer preview:', buffer.substring(0, 200));
        const readable = new stream.Readable();
        readable._read = () => { };
        readable.push(buffer);
        readable.push(null);

        console.log('Starting CSV parsing...');
        readable
            .pipe(csv())
            .on('data', (row) => {
                console.log('Processing row:', row);
                // Map CSV columns to lead fields
                const lead = {
                    name: row.name || row.Name || '',
                    email: row.email || row.Email || '',
                    domain: row.domain || row.Domain || '',
                    status: row.status || row.Status || 'new',
                    jobTitle: row.jobTitle || row['Job Title'] || row.job_title || '',
                    managementLevel: row.managementLevel || row['Management Level'] || row.management_level || '',
                    department: row.department || row.Department || '',
                    location: row.location || row.Location || '',
                    industry: row.industry || row.Industry || '',
                    skills: row.skills || row.Skills || '',
                    companyName: row.companyName || row['Company Name'] || row.company_name || '',
                    companyLocation: row.companyLocation || row['Company Location'] || row.company_location || '',
                    companySize: row.companySize || row['Company Size'] || row.company_size || '',
                    revenue: row.revenue || row.Revenue || '',
                    addedById: req.body.addedById ? Number(req.body.addedById) : 1
                };
                console.log('Mapped lead:', lead);
                if (lead.name && lead.email) {
                    leads.push(lead);
                } else {
                    console.log('Skipping lead - missing name or email');
                }
            })
            .on('end', async () => {
                const createdLeads = [];
                const errors = [];
                for (const leadData of leads) {
                    try {
                        if (leadData.name && leadData.email) {
                            const newLead = await createLead(leadData);
                            createdLeads.push(newLead);
                        }
                    } catch (error) {
                        console.error('Error creating lead:', leadData, error.message);
                        errors.push({ leadData, error: error.message });
                    }
                }
                res.json({
                    message: `Successfully imported ${createdLeads.length} leads${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
                    leads: createdLeads,
                    errors: errors.length > 0 ? errors : undefined
                });
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                res.status(400).json({ error: 'Invalid CSV file' });
            });
    } catch (error) {
        console.error('Error importing leads:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
