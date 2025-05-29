import React from 'react';
import { Link } from "react-router-dom";
import { Box, Typography, Button } from '@mui/material';
import "./Home.css";

const HeroBanner = () => {
  return (
    <Box
      sx={{
        pt: { lg: '90px', xs: '90px' }, 
        mt: { lg: '0px', xs: '70px' },
        ml: { sm: '60px' },
        display: 'flex',
        alignItems: 'flex-start', // Align content to the top-left
        flexDirection: 'column', // Ensure all elements stack vertically
      }}
      position="relative"
      p="20px"
    >
      {/* SmartRep Header */}
      <Typography
        id="urban-athlete"
        className="typewriter"
        fontWeight="600"
        fontSize={{ lg: '48px', xs: '36px' }}
        color="white"
        pb="20px"
        sx={{ textAlign: 'left' }} // Align text to the left
      >
        SmartRep
      </Typography>

      {/* Supporting Text */}
      <Typography
        className="typehead"
        fontWeight={700}
        sx={{
          fontSize: { lg: '44px', xs: '32px' },
          color: 'white',
          textAlign: 'left', // Align text to the left
        }}
        mb="20px"
      >
        <h2>We are here to help</h2>
        <h2>you to achieve your</h2>
        <h2>fitness dreams</h2>.
      </Typography>

      {/* Button */}
      <Button
        className="glow-on-hover"
        variant="contained"
        component={Link}
        to="../pages/features"
        sx={{ alignSelf: 'flex-start' }} // Align the button to the left
      >
        <b>What we offer</b>
      </Button>
    </Box>
  );
};

export default HeroBanner;
