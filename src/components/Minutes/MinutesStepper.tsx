import React from "react";
import { Card, CardContent, Stepper, Step, StepLabel } from "@mui/material";

const MinutesStepper: React.FC = () => {
  const currentStep = 1; // This should come from props or context

  return (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Stepper activeStep={currentStep} alternativeLabel>
          <Step>
            <StepLabel>Bản nháp</StepLabel>
          </Step>
          <Step>
            <StepLabel>Đang xét duyệt</StepLabel>
          </Step>
          <Step>
            <StepLabel>Đã ký</StepLabel>
          </Step>
          <Step>
            <StepLabel>Hoàn thành</StepLabel>
          </Step>
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default MinutesStepper;