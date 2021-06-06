#include <OneWire.h>
#include <DallasTemperature.h>
#include "HX711.h"
#define ONE_WIRE_BUS D4
#define calibration_factor -1050 //This value is obtained using the SparkFun_HX711_Calibration sketch
#define LOADCELL_DOUT_PIN  D7
#define LOADCELL_SCK_PIN  D6

HX711 scale;

OneWire oneWire(ONE_WIRE_BUS);

DallasTemperature sensors(&oneWire);

float Celcius=0;

const int buzzer = D5; //buzzer to arduino pin 5


void setup(){
 
  pinMode(buzzer, OUTPUT); // Set buzzer - pin 9 as an output
  
  Serial.begin(9600);
  sensors.begin();
 

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor); //This value is obtained by using the SparkFun_HX711_Calibration sketch
  scale.tare(); //Assuming there is no weight on the scale at start up, reset the scale to 0

}


void loop(){

  sensors.requestTemperatures(); 
  Celcius=sensors.getTempCByIndex(0);
 
  
  Serial.print("water:"); Serial.print(scale.get_units(), 1); Serial.print(";temp:"); Serial.println(Celcius); //scale.get_units() returns a float
  
    if (Celcius >= 100){
      delay(1000);
      tone(buzzer, 1000); // Send 1KHz sound signal...
      delay(1000);        // ...for 1 sec
      noTone(buzzer);     // Stop sound...
      delay(2000);        // ...for 1sec
      noTone(buzzer);
    }
  
}
