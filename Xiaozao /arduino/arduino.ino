

void setup() {
  Serial.begin(9600);
  pinMode(3, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  analogWrite(3, 0);
  analogWrite(9, 0);
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');

    if (line.length() > 0) {
      
        
        int value = line.toInt();
        if (value == 1) {
          analogWrite(3, 255);
          delay(2000);
          analogWrite(3, 0);
        } else if (value == 0) {
          analogWrite(9, 255);
          delay(2000);
          analogWrite(9, 0);
        }
        
    }
  }
}
