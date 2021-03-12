# Cordova jQuery Downloader

## File Transfer -> XHR
- https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
- Make sure data is coming from HTTPS for Android to work


## COMPLETED
- Added background mode plugin. Turns on at beginning of download process and turns off upon complete
- Tried to get File Transfer plugin to download AND track progress of multiple files, but didn't work
- Migrated to XHR after reading Cordova's deprecation notice 
- https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html
- Updated download process to use an array of XHR items
- Binded a counter into the XHR Event Listeners to track each of the downloading items
- Added logic to display multiple progess downloaders at once, showing item: index, name, and percent downloaded
- After a download starts, it checks to see if the max allowable is already downloading, and starts another if not.
- After download completes: it writes file to device, deletes the corresponding progress display, checks to see if it can queue another yet.
- Updated display text to show total files in the entire file list queue and the downloads in progress
- Updated onComplete checker to also check in-progress-downloads before finishing


## ISSUES
- Works fine on both emulators, but when I went to iOS device, I got a memory error. I added some code to try and clear out memory better upon finishing downloads. I didn't get a chance to finish debugging that. The iOS device had several gig of available space.
- When cordova-plugin-file is writing the file, everything hangs for a beat - longer for bigger files.


### iOS Device memory bug
Both emulators work fine. Did not get to test Android device. iOS 14.3 iphone7 threw this error after the 2-3 files downloaded/write.
```
Details
The app “DownloadProcess” on Ascedia iPhone7 quit unexpectedly.
Domain: IDEDebugSessionErrorDomain
Code: 4
Failure Reason: Message from debugger: Terminated due to memory issue
--
System Information
macOS Version 11.2 (Build 20D64)
Xcode 12.4 (17801) (Build 12D4e)
Timestamp: 2021-03-10T08:23:28-06:00
```



## TODO
- could update the status after 100% and before done to a writing file status
- file writer causes progress to slow
- add cancel button(s)
- memory issue


## Cordova Plugins
```
cordova-plugin-androidx 3.0.0 "cordova-plugin-androidx"
cordova-plugin-androidx-adapter 1.1.3 "cordova-plugin-androidx-adapter"
cordova-plugin-app-version 0.1.12 "AppVersion"
cordova-plugin-background-download 0.0.2 "Background Download"
cordova-plugin-background-mode 0.7.3 "BackgroundMode"
cordova-plugin-device 2.0.3 "Device"
cordova-plugin-dialogs 2.0.2 "Notification"
cordova-plugin-document-viewer 1.0.0 "SitewaertsDocumentViewer"
cordova-plugin-email-composer 0.9.2 "EmailComposer"
cordova-plugin-file 6.0.2 "File"
cordova-plugin-file-opener2 3.0.5 "File Opener2"
cordova-plugin-file-transfer 1.7.1 "File Transfer"
cordova-plugin-google-analytics 1.9.0 "Google Universal Analytics Plugin"
cordova-plugin-inappbrowser 4.1.0 "InAppBrowser"
cordova-plugin-ionic-keyboard 2.2.0 "cordova-plugin-ionic-keyboard"
cordova-plugin-network-information 2.0.2 "Network Information"
cordova-plugin-powermanagement 1.0.5 "Cordova PowerManagement plugin"
cordova-plugin-screen-orientation 3.0.2 "Screen Orientation"
cordova-plugin-splashscreen 6.0.0 "Splashscreen"
cordova-plugin-statusbar 2.4.3 "StatusBar"
cordova-plugin-whitelist 1.3.4 "Whitelist"
cordova-plugin-x-socialsharing 6.0.3 "SocialSharing"
es6-promise-plugin 4.2.2 "Promise"
```

### Cordova Plugin Background Mode
- https://github.com/katzer/cordova-plugin-background-mode