//----DEPENDENCIES----//
// cordova - File plugin
// moment.js
// jQuery

//---HTML DEPENDENCIES---//
// #status-title
// #status-body
// #progressbar
// #last-updated


//----REFERENCE-----//
var filesToDownload = [
	{
		name: 'test-5mb.zip',
		url: 'http://ipv4.download.thinkbroadband.com/5MB.zip',
		lastUpdated: '2021-02-14T17:58:31Z'
	},
	{
		name: 'test-10mb.zip',
		url: 'http://87.76.21.20/test.zip',
		lastUpdated: '2021-02-15T17:58:31Z'
	},
	{
		name: 'test-20mb.zip',
		url: 'http://ipv4.download.thinkbroadband.com/20MB.zip',
		lastUpdated: '2021-02-14T17:58:31Z'
	},
	{
		name: 'test-50mb.zip',
		url: 'http://ipv4.download.thinkbroadband.com/50MB.zip',
		lastUpdated: '2021-02-14T17:58:31Z'
	},
	{
		name: 'test-100mb.zip',
		url: 'http://ipv4.download.thinkbroadband.com/100MB.zip',
		lastUpdated: '2021-02-14T17:58:31Z'
	}
]



//---VARIABLES----//
var downloadFileName, downloadFileURL, downloadFileDate;
var appFileSystem, appRootUrl;
var filesDownloaded, isUpdating;

var downloadingArr = [];
var ftCounter = 0;//FileTransferCounter
var ftArr = [];//FileTransferArray
var maxDownloads = 3;
var downloadsInProgress = 0;
var current = '';


//---MAIN FUNCTION---//
// Run downloadFile() to trigger the start of downloading the assets from
// the filesToDownload array


//---SETUP---//
var app = {
	// Application Constructor
	initialize: function() {
		console.log('downloadProcess.app.initialize()');
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},
	// deviceready Event Handler
	onDeviceReady: function() {
		console.log('downloadProcess.app.onDeviceReady()');
		this.receivedEvent('deviceready');
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFileSystemInfo, fail);

	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('downloadProcess.app.receivedEvent()');
		console.log('Received Event: ' + id);

	}
};

app.initialize();

function getFileSystemInfo(fileSystem){
	appFileSystem = fileSystem;
	appRootUrl = appFileSystem.root.nativeURL;
	console.log('downloadProcess.getFileSystemInfo().appFileSystem: ' + JSON.stringify(appFileSystem));
	console.log('downloadProcess.getFileSystemInfo().appRootUrl: ' + appRootUrl);
}



//---DOWNLOAD PROCESS---//

//begin or reset download process
function beginDownloadProcess() {
	console.log('beginDownloadProcess()');
	downloadingArr = [];
	ftCounter = 0;
	ftArr = [];
	downloadFile();

	//TODO CAN WE CANCEL?
	//TODO: FINSH STYLING
}

function downloadFile() {
	console.log('downloadProcess.downloadFile().filesToDownload: ' + filesToDownload.length);
	
	if (filesToDownload.length > 0) {
		console.log('filesToDownload[0]: ' + JSON.stringify(filesToDownload[0]));
		// downloadFileName = filesToDownload[0].name;
		// downloadFileURL = filesToDownload[0].url;
		// downloadFileDate = filesToDownload[0].lastUpdated;

		// console.log('Download this file: ' + downloadFileName);
		// console.log('From Here: ' + downloadFileURL);
		// console.log('File Last Update: ' + downloadFileDate);

		if (filesToDownload[0].name == "") {
			//error
			console.log('no file name, skipping file');
			filesToDownload.shift();

			updateFileDownloadProgress();
		} else {
			//check if file exists
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSForDownload, fail);
		}
	} else {
		//no files to download
		updateFileDownloadProgress();
	}
}

function gotFSForDownload(error) {
	appFileSystem.root.getFile(encodeURI(filesToDownload[0].name), {
		create: false,
		exclusive: false
	}, successFileExists, failFileDoesNotExist);
}

function successFileExists(file){
	console.log('successFileExists');

	//set the storage var
	//if(!appStorageDir){
		//appStorageDir = file.toNativeURL().substr(0, file.toNativeURL().lastIndexOf("/") + 1);
	//}
	//console.log('successFileExists.appStorageDir: ' + appStorageDir);

	if(isUpdating){
		var storedLastUpdated = localStorage.getItem('lastUpdated');
		console.log('storedLastUpdated: ' + storedLastUpdated);

		//compare the dates of the files from DAM and when the app last updated
		console.log('the files date: '+ filesToDownload[current].lastUpdated);
		console.log('app last updated date: '+ storedLastUpdated);

		if (storedLastUpdated < filesToDownload[current].lastUpdated) {
			//file exists but needs to be updated
			console.log('File Exists: "' + file.name + '" but needs to be updated.');
			startFileTransfer();

		} else {
			//file exists, doesnt need to be updated, get the next one
			console.log('File Exists: ' + file.name);
			console.log('but does not need to be updated date');
			//remove first file from download list to continue through the list
			filesToDownload.shift();
			updateFileDownloadProgress();
		}
	} else {
		//just checking assets on device without updating
		filesToDownload.shift();
		updateFileDownloadProgress();   
	}
}

function fail(){
	console.log('fail fileSystem Info');
}

function failFileDoesNotExist(error) {
	console.log('file does not exist, so start fileTransfer');
	
	setTimeout(function(){ 
		startFileTransfer();
	}, 300);
}




/**
 * Start file transfer with XHR
 * Create a FileTransferArray, then create each new instance as part of the array so they don't get overwritten
 * Add event listeners, binding the counter so you can keep track of the multiple items running
 * https://stackoverflow.com/questions/51564660/xmlhttprequest-in-cordova-for-android
 */
function startFileTransfer(){
	console.log('startFileTransfer().ftCounter: ' + ftCounter);
	//downloadingArr.push(filesToDownload[0]);
	downloadingArr[ftCounter] = filesToDownload[0];
	filesToDownload.shift();
	console.log('startFileTransfer.downloadingArr.pushed: ' + JSON.stringify(downloadingArr));

	

	var divProg = '<div class="progress-holder js-progress-downloader js-prog-' + ftCounter + '">';
			divProg += '<div class="progressbar-text js-progressbar-text">';
				divProg += '<span class="title">' + ftCounter + ': ' + downloadingArr[ftCounter].name + '</span>';
				divProg += '<span class="prog js-progressbar-text-perc">XX</span>';
			divProg += '</div>';
			divProg += '<div class="progressbar js-progressbar"></div>';
		divProg += '</div>';


	$('.js-loader').append(divProg);
	$('#status-title').html("Files remaining: " + filesToDownload.length);

	//creat download
	ftArr[ftCounter] = new XMLHttpRequest();
	ftArr[ftCounter].addEventListener("progress", onFileProgress.bind(null, ftCounter));
	ftArr[ftCounter].addEventListener("load", onFileDownloadSuccess.bind(null, ftCounter, ftArr[ftCounter]));
	ftArr[ftCounter].addEventListener("error", onFileDownloadError.bind(null, ftCounter));

	// Make sure you add the domain name to the Content-Security-Policy <meta> element.
	ftArr[ftCounter].open("GET", downloadingArr[ftCounter].url, true);
	// Define how you want the XHR data to come back
	ftArr[ftCounter].responseType = "blob";
	//start download
	ftArr[ftCounter].send(null);


	ftCounter ++;//increment counter
	console.log("startFileTransfer.ftCounter++ " + ftCounter);

	downloadsInProgress = getDownloadsInProgress ();
	$('#status-body').html("Downloads remaining1: " + downloadsInProgress);
	if(downloadsInProgress < maxDownloads) {
		console.log('download started, and theres room for more! shift, update, and check the list');
		
		setTimeout(function(){ 
			updateFileDownloadProgress();  
		}, 300);
	}
	
}



/**
 * Get number of downloaders still on screen
 */
function getDownloadsInProgress () {
	downloadsInProgress = $('.js-progress-downloader').length;
	console.log("getDownloadsInProgress: " + downloadsInProgress);
	return downloadsInProgress;
}



/**
 * XHR callback file loading error
 * progress on transfers from the server to the client (downloads)
 * https://forum.ionicframework.com/t/how-to-download-stuff-now-that-transfer-file-is-deprecated/127451/8
 * 
 * @param {*} index  //index in the array that this XHR is tracking
 * @param {*} event 
 */
function onFileDownloadError (index, event) {
	console.log('onFileDownloadError.event: ' + event + '  ~-- index: ' + index);
}


/**
 * XHR callback success for file progress loading
 * progress on transfers from the server to the client (downloads)
 * https://forum.ionicframework.com/t/how-to-download-stuff-now-that-transfer-file-is-deprecated/127451/8
 * 
 * @param {*} index  //index in the array that this XHR is tracking
 * @param {*} event 
 */
function onFileProgress (index, event) {
	if (event.lengthComputable) {
		var percentComplete = event.loaded / event.total * 100;
		console.log('onFileProgress.percentComplete: ' + percentComplete + '  ~-- index: ' + index);

		$('.js-prog-' + index + ' .js-progressbar-text-perc').html(percentComplete.toFixed(2) + '%');
		$('.js-prog-' + index + ' .js-progressbar').css("width", percentComplete + "%");

	} else {
		// Unable to compute progress information since the total size is unknown
		$('.js-prog-' + index + ' .js-progressbar-text-perc').html("Downloading...");
	}
}

/**
 * XHR callback success for file onload. process blob then write file
 * @param {*} index //index in the array that this XHR is tracking
 * @param {*} xhr 
 * @param {*} event 
 */
function onFileDownloadSuccess (index, xhr, event) {
	//console.log('onFileDownloadSuccess.event: ' + JSON.stringify(event));
	console.log('onFileDownloadSuccess.index: ' + index);
	console.log('onFileDownloadSuccess.xhr.response: ' + xhr.response);
	var blob = xhr.response;
	console.log('blob.size: ' + blob.size);
	console.log('blob.type: ' + blob.type);
	console.log("onFileDownloadSuccess.WORKS!!!!");
	//console.log("onFileDownloadSuccess.ftCounter: " + ftCounter);

	// Save the file in the main storage
	appFileSystem.root.getFile(downloadingArr[index].name, { create: true }, function (fileEntry) {
		console.log('fileEntry: ' + JSON.stringify(fileEntry));
		fileEntry.createWriter(function (fileWriter) {
			fileWriter.onwriteend = function (e) {
				console.log('Write of file completed: ' + downloadingArr[index].name);

				$('.js-prog-' + index + ' .js-progressbar-text-perc').html('DONE');
				$('.js-prog-' + index + '').addClass('done');
				$('.js-prog-' + index + '').removeClass('js-progress-downloader');//TODO: SWITCH TO REMOVE DIV COMPLETELY

				setTimeout(function(){ 
					downloadsInProgress = getDownloadsInProgress ();
					$('#status-body').html("Downloads remaining2: " + downloadsInProgress);

					updateFileDownloadProgress();  
				}, 300);

			};
			fileWriter.onerror = function (e) {
				console.log('Write failed: ' + downloadingArr[index].name);
			};
			fileWriter.write(blob);
		} );
	} );


}







//TODO: WIRE UP FAIL

/* on file download fail */
function onFileDownloadFail(error) {
	console.log('file not downloaded. Error: ' + JSON.stringify(error));
	fileDownloadError = true;
	fileDownloadErrorList.push(filesToDownload[0]);

	downloadingArr.shift();
	//filesToDownload.shift();
	updateFileDownloadProgress();
}



/* update file download progress */
function updateFileDownloadProgress() {
	console.log('updateFileDownloadProgress Files remaining: ' + filesToDownload.length);
	$('#status-title').html("File check remaining: " + filesToDownload.length);

	if (filesToDownload.length == 0) {

		//TODO: IF NO MORE TO QUEUE UP, CHECK WHAT IS CURRENTLY DOWNLOADING

		downloadsInProgress = getDownloadsInProgress ();	
		if(downloadsInProgress > 0) {
			console.log('keep running until all files are done downloading and writing to system');
			return false;
		}

		filesDownloaded = 'true';
		localStorage.setItem('contentVerified', true);
		contentVerified = true;
		console.log("ALL FILES DOWNLOADED!!!");

		if(!isUpdating){
			$('#status-title').html('Asset');
			$('#status-body').html('Check complete.');

		} else if(isUpdating){
			$('#status-title').html('Asset');
			$('#status-body').html('Update complete.');

			var today = moment();
			//need to make this match the date layout
			var lastUpdated = today.toISOString().replace(/.\d+Z$/g, "Z");
			localStorage.setItem('lastUpdated', lastUpdated);

			var momentDate = moment(today).format("MMM Do YYYY, h:mm:ss a");
			$('#last-updated').text(momentDate);
		}

		//Everything downloaded, now set up the interface
		// initContent();

	} else {
		downloadFile();
	}
}