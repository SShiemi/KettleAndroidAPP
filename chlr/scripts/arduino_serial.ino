#include  <SimpleDHT.h> 

int pinDHT11 = 4; 
SimpleDHT11 dht11;

void setup() {
	Serial.begin(9600);
}

void loop() {

	byte temperature=0;
	bute humidity=0;

	int err=SimpleDHTErrSuccess;

	if ((err = dht11.read(pinDHT11, &temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
		Serial.print("Read DHT11 failed, err=");
		Serial.println(err););
		delay(1000);
		return;
	}

	Serial.print("Sample OK:");
	Serial.print((int)temperature);
	Serial.print("ºC, ");
	Serial.print((int)humidity);
	Serial.println(" H");

	delay(1500);
}