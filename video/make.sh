set -e
FB="C\:/Windows/Fonts/georgiab.ttf"; FR="C\:/Windows/Fonts/georgia.ttf"
BG=0x2a0508
# still segment: img dur title sub out
seg(){ A1="min(1,t/0.6)"; A2="min(1,max(0,(t-0.4)/0.6))"; [ -n "$6" ] && A1=1 && A2=1; ffmpeg -y -loglevel error -loop 1 -framerate 30 -t $2 -i "$1" -filter_complex \
"color=c=$BG:s=1080x1920:r=30:d=$2[bg];[0:v]crop=780:1331:0:214,scale=920:-1[s];[bg][s]overlay=80:360,\
drawtext=fontfile='$FB':text='$3':fontcolor=0xF3D79B:fontsize=76:x=(w-text_w)/2:y=120:alpha='$A1',\
drawtext=fontfile='$FR':text='$4':fontcolor=0xFFF3DF:fontsize=44:x=(w-text_w)/2:y=235:alpha='$A2',\
fade=t=in:st=0:d=0.3,fade=t=out:st=$(awk "BEGIN{print $2-0.3}"):d=0.3,format=yuv420p" -r 30 -c:v libx264 -crf 18 $5; }
seg ../video/shots/countdown.png 3 "45 days to go." "Who do I book, and when?" seg/a.mp4
seg ../video/shots/home.png 2.5 "SINGAAR" "Artists for every celebration" seg/b.mp4
seg arr/f000.png 2 "Watch her arrive." "Live, on your wedding morning" seg/c1.mp4 s
seg arr/f018.png 2 "Watch her arrive." "Live, on your wedding morning" seg/c3.mp4 s
seg arr/f042.png 2.5 "It is muhurtham time." "Every ritual, on time" seg/c5.mp4
# end card
ffmpeg -y -loglevel error -loop 1 -framerate 30 -t 2.5 -i ../assets/logo.webp -filter_complex \
"color=c=$BG:s=1080x1920:r=30:d=2.5[bg];[0:v]scale=860:-1[l];[bg][l]overlay=(W-w)/2:380,\
drawtext=fontfile='$FB':text='Every ritual. One place.':fontcolor=0xF3D79B:fontsize=64:x=(w-text_w)/2:y=1080,\
drawtext=fontfile='$FR':text='Bangalore and Chennai':fontcolor=0xFFF3DF:fontsize=44:x=(w-text_w)/2:y=1190,\
drawtext=fontfile='$FB':text='singaar.vercel.app':fontcolor=0xFFFFFF:fontsize=52:x=(w-text_w)/2:y=1500,\
fade=t=in:st=0:d=0.6,format=yuv420p" -r 30 -c:v libx264 -crf 18 seg/d.mp4
ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p singaar-linkedin-draft.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 singaar-linkedin-draft.mp4
