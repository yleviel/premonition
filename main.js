var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');


var DEFAULT_CONFIG = {
    filesToCheck : ['package.json'],
    fieldsToCheck: ["devDependencies", "dependencies"],
    modulesToCheck: null
};

function TestResult(testPassed, testInformation) {
    if (testPassed == null && testInformation == null) {
        testPassed = true;
    } else if (testPassed != null && testInformation == null) {
        testInformation = testPassed;
        testPassed = false;
    }
    
    this.testPassed = !!testPassed;
    this.testInformation = testInformation || "";
}

function getFileJSON(filePath) {
    try{
        var obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return obj;
    } catch ( e ) {
        return null;
    }
}

var checkFile = function(filePath, fileJSON, config){
    var dependenciesTested = [];
    
    _.forEach(config.fieldsToCheck, function(fieldToCheck){
        if ( !(fieldToCheck in fileJSON)) {
            console.log('could not locate the field "' + fieldToCheck + '" in the ' + filePath + ' file ');
            return;
        }
        
        var field = fileJSON[fieldToCheck];
        
        var modulesToUpdate = _.keys(field);
        
        if (_.isEmpty(modulesToUpdate)) {
            console.log('the field "' + fieldToCheck + '" in the ' + filePath + ' file has no modules listed that match the criteria');
            return;
        }

        var json = _.cloneDeep(fileJSON);
        
        var newField = json[fieldToCheck];
        
        _.forEach(modulesToUpdate, function(module){
            newField[module] = "latest";
        });
        
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
        
        var modulesTested = modulesToUpdate.join(',');
        var runResult = shell.exec("npm test");
        
        dependenciesTested.push(new TestResult(runResult.code === 0, modulesTested));
    });
    
    return dependenciesTested;
};

/**
 * @param config The overall config object for the fixture server.
 * @param config.filesToCheck
 * @param config.modulesToCheck
 * @param config.fieldsToCheck
 * @returns 0 if all tests passed, 1 otherwise 
 */
var start = function(cwd, config) {
    var exitCode = 0;
    var appConfig = _.assign(config, DEFAULT_CONFIG);
    

    var appOutput = _.map(appConfig.filesToCheck, function(fileToCheck){
        var fullPathFile = path.join(cwd, fileToCheck);
        
        if (!fs.existsSync(fullPathFile)) {
            return new TestResult(false, fullPathFile + " does not exist");
        }
        
        var fileJSON = getFileJSON(fullPathFile);
        
        if (fileJSON == null) {
            return new TestResult(false, fullPathFile + " is not a valid JSON file");
        }
        
        var oldFile = fullPathFile;
        var oldFileRenamed = oldFile + '.premonition.old';
        
        // premonition setup
        // copy the package.json (or whatever file) to a package.json.premonition.old
        fs.writeFileSync(oldFileRenamed, fs.readFileSync(oldFile));
        
        var output = checkFile(oldFile, fileJSON, appConfig);
        
        //clean up the mess created by premonition setup
        fs.unlinkSync(oldFile);
        fs.renameSync(oldFileRenamed, oldFile);
        
        return output;
    });
    
    console.log('appOutput', appOutput);

    return exitCode;
};

// fixture server public API
module.exports  = {
    start : start,
    
};