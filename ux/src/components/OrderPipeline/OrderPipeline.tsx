import { Box, Stepper, Step, StepLabel, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Order } from '../../services/orderService';

interface OrderPipelineProps {
  order: Order;
}

// Define the order status pipeline
const statusPipeline = ['Pending', 'Preparing', 'Ready', 'Delivered'];

// Custom styled components
const PipelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1]
}));

const StatusStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiStepLabel-active': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepLabel-completed': {
    color: theme.palette.success.main,
  }
}));

export const OrderPipeline = ({ order }: OrderPipelineProps) => {
  // If order is cancelled, show a different view
  if (order.status === 'Cancelled') {
    return (
      <PipelineContainer>
        <Typography variant="subtitle1" gutterBottom>
          Order Pipeline
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'error.main', 
          color: 'error.contrastText',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body1">
            This order has been cancelled
          </Typography>
        </Box>
      </PipelineContainer>
    );
  }

  // Find the active step based on current status
  const activeStep = statusPipeline.indexOf(order.status);
  
  return (
    <PipelineContainer>
      <Typography variant="subtitle1" gutterBottom>
        Order Pipeline
      </Typography>
      <StatusStepper activeStep={activeStep} alternativeLabel>
        {statusPipeline.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </StatusStepper>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {activeStep === -1 ? (
            'Unknown status'
          ) : activeStep === statusPipeline.length - 1 ? (
            'Order completed and delivered'
          ) : (
            `Next step: ${statusPipeline[activeStep + 1]}`
          )}
        </Typography>
      </Box>
    </PipelineContainer>
  );
};
