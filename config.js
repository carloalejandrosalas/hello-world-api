/**
 *  Create and export configuration variables
 * 
 */

// Container for all envioroments
var envioroments = {};

// Staging (default) environment
envioroments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging'
};

envioroments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production'
};

// Determine which envionment was passed as a commandñ-line-argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the currrent is one of the environmets above, if not, default to staging
var envionmentToExport = typeof(envioroments[currentEnvironment]) == "object" ? envioroments[currentEnvironment] : envioroments.staging;

module.exports = envionmentToExport;