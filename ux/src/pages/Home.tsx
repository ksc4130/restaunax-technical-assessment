import { Link } from "react-router-dom";
import { Box, Typography, Button, Container,  } from "@mui/material";
import { styled } from "@mui/material/styles";

import logo from '../assets/restaunax_logo3.png';

const StyledLink = styled(Link)(() => ({
  textDecoration: 'none',
}));

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Restaunax"
          sx={{ width: 300, mb: 2 }}
        />
        <Typography variant="h6" sx={{ mt: 0, mb: 4, textAlign: 'center', maxWidth: 'xl', color: 'text.secondary' }}>
          Manage your restaurant effortlessly — from tracking orders and managing dishes to summarizing your daily operations.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <StyledLink to="/dashboard">
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 3, py: 1.5, borderRadius: 3 }}
            >
              Go to Dashboard
            </Button>
          </StyledLink>
          <StyledLink to="/menu">
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              sx={{ px: 3, py: 1.5, borderRadius: 3 }}
            >
              View Menu
            </Button>
          </StyledLink>
        </Box>
      </Box>
    </Container>
  );
}
