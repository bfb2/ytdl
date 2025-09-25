chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
   if (msg.action === "download playlist") {
    const typeAndQuality = msg.option.split('-')
    chrome.downloads.download({
      url:`https://yt-downloader-backend-p1up.onrender.com/download-playlist?url=${encodeURIComponent(msg.url)}&type=${typeAndQuality[0]}&quality=${typeAndQuality[1]}`,
      filename:`${msg.playlistName}.zip`
    })
  } 
  else if(msg.action =='download'){
    chrome.downloads.download({
      url:`https://yt-downloader-backend-p1up.onrender.com/download-video?url=${encodeURIComponent(msg.url)}&format_id=${msg.format_id}&ext=${msg.ext}`,
      filename:`${msg.title}.${msg.ext}`
    })
  }
  else if(msg.action == 'fetchDlOptions'){
    fetch(`https://yt-downloader-backend-p1up.onrender.com/download-options?url=${msg.url}`)
    .then(res=>res.json())
    .then(data=>{
        sendResponse(data)
    })
    return true
  }
  
});
