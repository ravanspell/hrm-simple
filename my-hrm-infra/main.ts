/**
 * Entry point for the CDKTF application.
 * Loads environment variables and initializes cloud stacks.
 */

import { App } from 'cdktf';
// import * as dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// Import cloud stacks
import { AWSStack } from './aws';
// import { GoogleCloudStack } from './google-cloud/allresources';
// import { AzureStack } from './azure/allresources'; // If using Azure

const app = new App();

// Initialize Cloud Stacks
new AWSStack(app, 'aws-stack');
// new GoogleCloudStack(app, 'google-cloud-stack');
// new AzureStack(app, 'azure-stack'); // If using Azure

app.synth();
