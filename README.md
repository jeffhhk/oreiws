# WebSocket App for OREI 4x4 Matrix Switch UHD-404R

My use case: Producing hybrid Zoom experience in large spaces with complex audio and video capture requirements.

- Offload video switching responsibilites from Zoom to hardware.
- Control your own projectors from your own computers locally without sending to Zoom and back, lowering latency and reducing distortion.
- (Future expansion hacking option) integration with audio mixing hardware.

# Hardware used for development and testing:
## 

| Item | Links | Description |
|---|---|---|
| Switch UHD-404R | <a href="https://www.orei.com/products/4k-switcher-splitter-hdmi-matrix-4x4-supports-ultrahd-4k-60hz-4-4-4-uhd-404r">Manufacturer page</a> <a href="https://www.amazon.com/OREI-Switcher-Splitter-4-Output-Supports/dp/B0BRR1ZF41">Amazon detail page</a> | OREI UHD-404R 4x4 Matrix Switch |
| USB to RS-232 adapter | <a href="https://www.amazon.com/OREI-Phoenix-Control-Compatible-Windows/dp/B0D4VVBFZ8">Amazon detail page</a> | (BUYER BEWARE - MINE WAS MISWIRED - I HAD TO USE AN OSCILLOSCOPE TO FIGURE IT OUT AND REWIRE) |
| USB HDMI Capture device | <a href="https://www.amazon.com/dp/B08Z3XDYQ7?th=1">Amazon detail page</a> | Guermok Video Capture Card, USB3.0 HDMI to USB C Audio Capture Card, 4K 1080P 60FPS Capture with Type-C Adapter Devices for Gaming Live Streaming, Video Recorder, Windows Mac OS System OBS Zoom</a>


# Software Install and Run

Tested with: <a href="https://nodejs.org/en">node.js</a> v22.6.0 on Ubuntu Linux 22.04.

    # clone
    cd <DIRECTORY WHERE YOU CLONED>
    npm install
    cp config.yaml.default config.yaml
    # edit as needed
    npm start
