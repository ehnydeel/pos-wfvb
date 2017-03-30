## POS WFVB
### A Ticket-Printing-System for WFVB


## Guide to setup RaspberryPi for POS-System
########################################
# 1. BASIC INSTALLATION
########################################
	- install raspbian jessie lite to sdcard
	- sudo raspi-config
		- expand filesystem
		- change user password
		- change timezone
		- change wifi-country
		- advanced
			- change hostname
			- memory split down to 32
			 (cause we don't need a gui)
	- reboot
	- update system to the latest version
		sudo apt-get update && sudo apt-get upgrade -y
	- install basic packages
		sudo apt-get install vim curl git htop nmon proftpd

########################################
# 2. INSTALL ACCESSPOINT INCL. DHCP-SERVER
########################################
########################################
# 2.1 Install hostapd 
########################################
source: https://jankarres.de/2015/06/raspberry-pi-wlan-access-point-einrichten/
	- install hostapd
		- sudo apt-get install hostapd
	- check available network interfaces
		- ifconfig
	- if possible use the extern one (wlan1)
	- configure hostapd
		- vi /etc/hostapd/hostapd.conf
			insert:
				interface=wlan1
				ssid="RPi_WFVB1"
				hw_mode=g
				channel=6
				macaddr_acl=0
				ignore_broadcast_ssid=0
				auth_algs=1
				wpa=2
				wpa_passphrase=12345678
				wpa_key_mgmt=WPA-PSK
				wpa_pairwise=TKIP
				rsn_pairwise=CCMP
	- define bew configuration as default
		sudo vi /etc/default/hostapd
		- change
				#DAEMON_CONF=""
			to
				DAEMON_CONF="/etc/hostapd/hostapd.conf"
	- configure network interface
		- sudo vi /etc/network/interfaces
			- change
					auto wlan1
					allow-hotplug wlan1
					iface wlan1 inet manual
					wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
				to
					allow-hotplug wlan1
					iface wlan1 inet static
						address 10.11.12.1
						netmask 255.255.255.0
########################################
# 2.2 Install isc-dhcp-server
########################################
source: https://jankarres.de/2015/06/raspberry-pi-wlan-access-point-einrichten/
	- install isc-dhcp-server
		sudo apt-get install isc-dhcp-server
	- configure isc-dhcp-server
		sudo vi /etc/default/isc-dhcp-server
		- replace
				#DHCPD_CONF=/etc/dhcp/dhcpd.conf
				#DHCPD_PID=/var/run/dhcpd.pid
				INTERFACES=""
			with
				DHCPD_CONF=/etc/dhcp3/dhcpd.conf
				DHCPD_PID=/var/run/dhcpd.pid
				INTERFACES="wlan1"
	- define dhcp-configurations (ip-range)
		sudo vi /etc/dhcp3/dhcpd.conf
		- add
				subnet 10.11.12.0 netmask 255.255.255.0 {
    			range 10.11.12.100 10.11.12.125;
    			option domain-name-servers 8.8.8.8, 8.8.4.4;
    			option routers 10.11.12.1;
				}
	- Now start the dhcp-server
		sudo ifconfig wlan1 10.11.12.1 netmask 255.255.255.0
		sudo /etc/init.d/isc-dhcp-server restart
		if the isc-server starts successfully the dhcp-server-creation
		is successful finished
	- To access the internet over the raspberry pi access point
		we have to configure the routing
		- sudo vi /etc/sysctl.conf
			replace
				#net.ipv4.ip_forward=1
			to
				net.ipv4.ip_forward=1
	- Additionally we have to forward the traffic with iptables.
		To to this permanently, so it automatically starts at boot we
		have to add following lines to /etc/rc.local right before "exit 0"
			sudo ifconfig wlan1 10.11.12.1 netmask 255.255.255.0 && sudo /etc/init.d/isc-dhcp-server restart
			iptables -A FORWARD -o wlan0 -i wlan1 -m conntrack --ctstate NEW -j ACCEPT
			iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
			iptables -t nat -F POSTROUTING
			iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
	- reboot the system!
			sudo reboot
	- NOW THE ACCESSPOINT SHOULD WORK CORRECT!
	 	TRY TO CONNECT TO THE ACCESSPOINT

########################################
# 3. Install cups print-server
########################################
- sudo apt-get install cups

########################################
# 4. Install i386 emulator for armhf 
########################################
source: https://www.lhinderberger.de/pi/2016/01/27/raspberry-pi-binary-x86-drivers.html
- Tell the system to accept x86 packages to install
	sudo dpkg --add-architecture i386
- Edit your apt sources.list and sources.list.d
	Before adding our x86 package repositories, there is one thing we have to do first:
	To make sure the apt will not get confused by x86 and ARM packages with the same name
	being available at the same time, we have to explicity specify the architecture of each
	available package repository. 

	You have to edit your /etc/apt/sources.list file and every file in /etc/apt/sources.d
	adding [arch=armhf] behind each accurence of deb

	example:
		deb http://archive.raspbian.org/raspbian jessie main contrib non-free
	would become:
		deb [arch=armhf] http://archive.raspbian.org/raspbian jessie main contrib non-free

- add i386 repositories
	next we have to add package sources for i386 packages to our apt configuration.
	we'll do it the obvious way and take the official debian repositories.
	of course you are free to choose other mirrors if you prefer.

	to do that you create the file /etc/apt/sources.list.d/i386.list and  insert the
	following lines:

	deb [arch=i386] http://ftp.debian.org/debian/ jessie main contrib non-free
	deb [arch=i386] http://ftp.debian.org/debian/ jessie-updates main contrib non-free
	deb [arch=i386] http://security.debian.org/ jessie/updates main contrib non-free

- update your local apt cache
	after we've fiddled around quite a bit with the package repository lists, the first
	we want to do is update our local apt cache by running:
	--> sudo apt-get update

- fix the gpg errors by or ignore them
	to fix simply type the following commands taking care to replace the number below
	with that of the key that was displayed in the error message:
	--> gpg --keyserver pgpkeys.mit.edu --recv-key  010908312D230C5F      
	--> gpg -a --export 010908312D230C5F | sudo apt-key add -

- install qemu-user and binfmt-support
	now comes a very important part. while we until now only configured our package 
	sources in order to be able to retrieve x86 binaries, now it is time to set the 
	system up for actually running them by using virtualization on a proccess level.
	that sound far more complicated than it is. in fact all you have to do is run:
	--> sudo apt-get install binfmt-support qemu-user

- install x86 libc
	most modern binary programs require the c standard library installed on your system
	to work properly. for arm, raspbian ships libc by default, but for x86 we have yet
	to install it:
	--> sudo apt-get install libc6:i386

	notice the :i386 suffix. this tells apt-get to explicity go and fetch the package
	for x86 rathen than for arm

########################################
# 5. Install Brother Printer Driver 720NW 
########################################
- Download printer driver from brother-website
- install the drivers by following command:
	sudo dpkg -i ql720nwcupswrapper-1.0.2-0.i386.deb

########################################
# 6. Create printer in cups 
########################################
- With webinterface create new printer
	QL-720NW with driver
	usb://Brother/QL-720NW?serial=000C6Z450126
	and official brother driver
- configure default-settings for the printer
- print testpage

########################################
# 7. Install direct-esc-printing 
########################################
source https://github.com/sudomesh/ql570
- Download files from github
	git clone https://github.com/sudomesh/ql570
	edit source-file
	vi ql570.c
		adjust 62 to 54
	"make" to compile and generate binary
	copy binary to user-path
		cp ql520 /usr/bin/ql720nw

########################################
# 8. Install direct-esc-printing 
########################################
create cronjob to ensure that printer always is activated
and has the correct configurations.
login as root (sudo su -)
create new file printerInit.sh
insert following content:

#!/bin/bash
# +==================================
# | printerInit.sh
# | ---------------------------------
# | Script to set permissions on
# | local usb printer /dev/usb/lp0
# | for use in pos-system
# +=================================

# check if device is avaiable
# and set permissions if it does
if [ -e '/dev/usb/lp0' ];
then
  chmod 666 /dev/usb/lp0
fi;

# Set the correct options for printing
lpoptions -p 720nw -o PageSize=54x2
#EOF

make the file exectuable
	chmod +x printerInit.sh

create a cronJob
	crontab -e
insert following line
* * * * * /bin/bash /root/printerInit.sh > /dev/null 2>&1

########################################
# 9. Install NODEJS
########################################
Download NodeJS-LTS ARMv7-Binary from nodejs-website
extract downloaded files
	--> tar xfv node-v4.4.7-....tar.xz
make local install directory
	mkdir -p ~/.local/install
move file to local install directory
edit profile-file to add the nodejs-binary-path
	# NODEJS-Path
	if [ -d "$HOME/.local/install/node-v4.4.7-linux-armv7l/bin" ] ; then
		PATH="$HOME/.local/install/node-v4.4.7-linux-armv7l/bin:$PATH"
	fi
reload .profile
	source .profile

########################################
# 10. Install NPM-Packages 
########################################
npm install -g express express-generator bower gulp grunt pm2 nodemon

########################################
# 11. Clone pos-project from github 
########################################
cd /home/pi
git clone https://github.com/ehnydeel/pos-wfvb
rename folder to pos
install npm-packages
	npm install
install bower packages
	bower install
start with pm2 app.js --name pos


########################################
# 12. Clone pos-project from github 
########################################
make pm2 run permanent
run pm2 startup
run the command in the output as root (sudo)
save the pm2 jobs
	pm2 save
	pm2 dump

########################################
# 13. config wpa_supplicant on wlan0 for internet access 
########################################
sudo vi /etc/network/interfaces
edit section for wlan0
	allow-hotplug wlan0
	iface wlan0 inet manual
		wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
generate passphrase for network
	wpa_passphrase <ssid> passphrase
	example: wpa_passphrase cNetwork 12345678
insert the output at the end of /etc/wpa_supplicant/wpa_supplicant.conf
sudo vi /etc/wpa_supplicant/wpa_supplicant.conf
	
