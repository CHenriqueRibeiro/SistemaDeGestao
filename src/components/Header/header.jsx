import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Logo from "@mui/material/Avatar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InfoIcon from "@mui/icons-material/Info";
import { useCarrinho } from "../../context/useCarrinho";
import Img from "../../assets/images/logoChegoFundoAmarelo.jpg";
import "./header.css";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useBusinessData } from "../../context/useBusinessData";

export default function Header() {
  const { color, businessHours, payment } = useBusinessData();
  const { handleCloseAlert, isAlertOpen } = useCarrinho();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          padding: " 10px 4px",
          position: "absolute",
          width: " 80%",
          minWidth: "270px",
          maxWidth: "540px",
          minHeight: "78px",
          borderRadius: "25px !important",
          boxShadow:
            "2px 0px 10px 1px rgba(0, 0, 0, 0.2), 4px 6px 10px 2px rgba(0, 0, 0, 0.14), 6px 6px 8px 3px rgba(0, 0, 0, 0.12)",
          border: `1px ${color} solid`,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Box id="teste">
          <Logo id="imglogo" alt="Remy Sharp" src={Img} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              color: " #29292c",
            }}
          >
            <h2>CheGO</h2>

            <Typography
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {<WhatsAppIcon />}85 987206514
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                }}
              >
                <Box
                  className={isAlertOpen ? "bolaVerde" : "bolaVermelha"}
                ></Box>
                {isAlertOpen ? "Aberto" : "Fechado"}
                <InfoIcon onClick={() => setIsModalOpen(true)} />
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
      {!isAlertOpen && (
        <Snackbar open={!isAlertOpen} onClose={handleCloseAlert}>
          <Alert
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            elevation={6}
            variant="filled"
            severity="error"
          >
            Estabelecimento fechado!
          </Alert>
        </Snackbar>
      )}

      <Dialog
        sx={{
          height: "100%",
        }}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <DialogTitle sx={{ height: "100%", background: "#FFFFFF" }}>
          Informações Adicionais
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
          }}
        >
          <Typography variant="h6">Horário de funcionamento: </Typography>
          {[
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
            "Domingo",
          ].map((day) => {
            const dayData = businessHours.find(
              (data) => data.day === day.toString()
            );
            return (
              <Typography key={day}>
                <b>{day}:</b>{" "}
                {dayData && dayData.startTime && dayData.endTime
                  ? `${dayData.startTime} às ${dayData.endTime}`
                  : "Fechado"}
              </Typography>
            );
          })}

          <Typography variant="h6">Formas de pagamento: </Typography>
          {payment.map((method, index) => (
            <Typography key={index} variant="subtitle2">
              <b>{method.forma.split("_").join(" ")}</b>
            </Typography>
          ))}
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFFFF",
          }}
        >
          <Button
            className="box-shadow click"
            sx={{
              background: color,
              color: "#FFFFFF",
              "&:hover": {
                background: color,
              },
            }}
            onClick={() => setIsModalOpen(false)}
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
