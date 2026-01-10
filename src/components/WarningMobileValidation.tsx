import { Box, Container, Typography } from 'convertupleads-theme'
import MobileOffIcon from '@mui/icons-material/MobileOff';

const WarningMobileValidation = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ height: 'auto', display: 'flex', justifyContent: 'center', margin: '40px auto 20px auto' }}>
                <img src="/discushy_logo_banner.png" alt="Discushy Logo" width={100} />
            </Box>
            <Box
                sx={{
                    mt: 5,
                    textAlign: "center",
                    backgroundColor: "#fff",
                    p: 4,
                    borderRadius: 3,
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                }}
            >
                <MobileOffIcon
                    sx={{ fontSize: 60, color: "warning.main", mb: 2 }}
                />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Desktop or Laptop Recommended
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    Please access Discushy from a desktop or laptop computer for the best experience.
                </Typography>
            </Box>
        </Container>
    )
}

export default WarningMobileValidation
