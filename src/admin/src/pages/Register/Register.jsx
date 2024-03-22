import {
  Box,
  Button,
  Chip,
  Typography,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
} from "@mui/material";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import {
  get,
  getDatabase,
  ref,
  set,
  push,
  onValue,
  off,
} from "firebase/database";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { BlockPicker } from "react-color";
export default function Register() {
  const [databaseData, setDatabaseData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [createCategory, setCreateCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [addNewItem, setAddNewItem] = useState(false);
  const [editedCategoryNewName, setEditedCategoryNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [additionalDays, setAdditionalDays] = useState([]);
  const [openColor, setOpenColor] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [selectedPayments, setSelectedPayments] = useState([]);

  const handleData = (snapshot) => {
    if (snapshot.exists()) {
      setDatabaseData(snapshot.val());
    } else {
      console.log("Nenhum dado encontrado no banco de dados.");
    }
  };

  const handleError = (error) => {
    console.error("Erro ao buscar dados do banco de dados:", error);
  };

  useEffect(() => {
    const db = getDatabase();
    const databaseRef = ref(db);

    onValue(databaseRef, handleData, handleError);

    return () => off(databaseRef, "value", handleData);
  }, []);
  useEffect(() => {
    const db = getDatabase();
    const databaseRef = ref(db, "horario_de_funcionamento");

    onValue(databaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const days = Object.keys(data).map((day) => ({
          day,
          startTime: data[day].startTime,
          endTime: data[day].endTime,
        }));
        setAdditionalDays(days);
      }
    });

    return () => off(databaseRef);
  }, []);

  const handleDelete = async (category) => {
    const db = getDatabase();
    const categoryRef = ref(db, category);

    try {
      await set(categoryRef, null);
    } catch (error) {
      console.error("Erro ao remover categoria e itens:", error);
    }
  };

  const handleEdit = (category) => {
    setEdit(true);
    setCreateCategory(true);
    setEditedCategoryName(category);
    setEditedCategoryNewName(category);
  };

  const handleSave = async () => {
    const db = getDatabase();
    try {
      if (editedCategoryNewName.trim() === "") {
        if (editedCategoryName.trim() !== "") {
          const categoryRef = ref(db, editedCategoryName);
          const snapshot = await get(categoryRef);
          if (snapshot.exists()) {
            console.log("A categoria já existe:", editedCategoryName);
          } else {
            await set(categoryRef, [editedCategoryName]);
          }
        } else {
          console.log("O nome da categoria não pode ser vazio.");
        }
      } else {
        if (
          editedCategoryName.trim() !== "" &&
          editedCategoryNewName.trim() !== ""
        ) {
          await set(ref(db, `${editedCategoryName}`), null);
          await set(
            ref(db, `${editedCategoryNewName}`),
            databaseData[editedCategoryName]
          );
        } else {
          console.log("Os nomes da categoria não podem ser vazios.");
        }
      }

      setEditedCategoryName("");
      setEditedCategoryNewName("");
      setEdit(false);
      setCreateCategory(false);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    }
  };

  const handleEditSave = async () => {
    const db = getDatabase();
    try {
      if (
        editedCategoryName.trim() !== "" &&
        editedCategoryNewName.trim() !== ""
      ) {
        const categoryData = databaseData[editedCategoryName] || [];
        await set(ref(db, `${editedCategoryName}`), null);
        await set(ref(db, `${editedCategoryNewName}`), categoryData);

        setEdit(false);
        setCreateCategory(false);
        setEditedCategoryName("");
        setEditedCategoryNewName("");
      } else {
        console.log("Os nomes da categoria não podem ser vazios.");
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    }
  };

  const handleAddItem = async () => {
    if (newItemValue.trim() !== "") {
      const db = getDatabase();
      const categoryRef = ref(db, editedCategoryName);
      try {
        await push(categoryRef, newItemValue);
        await set(
          ref(db, `${editedCategoryNewName}`),
          databaseData[editedCategoryName]
        );
        setNewItemValue("");
      } catch (error) {
        console.error("Erro ao adicionar novo item à categoria:", error);
      }
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };
  const handleCloseColor = () => {
    setOpenColor(false);
  };
  const handleClosePayment = () => {
    setOpenPayment(false);
  };

  const handleAddDay = () => {
    if (additionalDays.length >= 7) {
      return;
    }

    setAdditionalDays([
      ...additionalDays,
      { day: "", startTime: "", endTime: "" },
    ]);
  };

  const handleSaveSchedule = async () => {
    const formattedSchedule = additionalDays.reduce((acc, day) => {
      const { day: dayOfWeek, startTime, endTime } = day;
      if (dayOfWeek && startTime && endTime) {
        acc[dayOfWeek] = { startTime, endTime };
      }
      return acc;
    }, {});

    const db = getDatabase();
    try {
      await set(ref(db, "horario_de_funcionamento"), formattedSchedule);
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar o horário de funcionamento:", error);
    }
  };

  const handleDayChange = (event, index) => {
    const updatedDays = [...additionalDays];
    updatedDays[index].day = event.target.value;
    setAdditionalDays(updatedDays);
  };

  const handleStartTimeChange = (event, index) => {
    const updatedDays = [...additionalDays];
    updatedDays[index].startTime = event.target.value;
    setAdditionalDays(updatedDays);
  };

  const handleEndTimeChange = (event, index) => {
    const updatedDays = [...additionalDays];
    updatedDays[index].endTime = event.target.value;
    setAdditionalDays(updatedDays);
  };
  const handleDeleteDay = (index) => {
    const updatedDays = [...additionalDays];
    updatedDays.splice(index, 1);
    setAdditionalDays(updatedDays);
  };
  const handleSavePaymentOptions = async () => {
    const db = getDatabase();
    try {
      const paymentOptionsRef = ref(db, "formaDePagamentos");
      await set(paymentOptionsRef, selectedPayments);
      setOpenPayment(false);
    } catch (error) {
      console.error("Erro ao salvar as formas de pagamento:", error);
    }
  };
  const handleSaveColor = () => {
    setColor(color);

    const db = getDatabase();
    const colorRef = ref(db, "corsecundaria");
    set(colorRef, [color]);

    setOpenColor(false);
  };

  return (
    <>
      <Box
        className="backgroundAdmin"
        sx={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Header />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "95%",
            height: "10rem",
            background: "#1E2C39",
            borderRadius: 3,
            mt: 3,
            mb: 3,
            pt: 1,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "95%",
              borderBottom: "1px #FFFFFF solid",
            }}
          >
            <Typography color={"#FFFFFF"}>Dados do estabelecimento</Typography>
            <EditRoundedIcon
              style={{ color: "#FFFFFF" }}
              onClick={() => setCreateCategory(true)}
            />
          </Box>
          <Box
            sx={{
              pt: "1rem",
              overflow: "auto",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              width: "95%",
              height: "15rem",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                width: "95%",
              }}
            >
              <OutlinedInput
                placeholder="Nome"
                sx={{
                  color: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "#FFFFFF",
                  },
                }}
              />
              <OutlinedInput
                placeholder="Telefone"
                sx={{
                  color: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "#FFFFFF",
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                width: "95%",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClickOpen}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "#FFFFFF",
                  },
                }}
              >
                Horario de funcionamento
              </Button>
              <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
                <DialogTitle>Selecione o horário de funcionamento</DialogTitle>
                <DialogContent>
                  {additionalDays.map((day, index) => (
                    <Box key={index}>
                      <FormControl sx={{ m: 1, minWidth: 200 }}>
                        <InputLabel id={`day-select-label-${index}`}>
                          Dia {index + 1}
                        </InputLabel>
                        <Select
                          labelId={`day-select-label-${index}`}
                          id={`day-select-${index}`}
                          value={day.day}
                          onChange={(e) => handleDayChange(e, index)}
                          input={<OutlinedInput label={`Dia ${index + 1}`} />}
                        >
                          <MenuItem value="segunda">Segunda-feira</MenuItem>
                          <MenuItem value="terca">Terça-feira</MenuItem>
                          <MenuItem value="quarta">Quarta-feira</MenuItem>
                          <MenuItem value="quinta">Quinta-feira</MenuItem>
                          <MenuItem value="sexta">Sexta-feira</MenuItem>
                          <MenuItem value="sabado">Sábado</MenuItem>
                          <MenuItem value="domingo">Domingo</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ m: 1 }}>
                        <InputLabel htmlFor={`start-time-input-${index}`}>
                          Início
                        </InputLabel>
                        <OutlinedInput
                          id={`start-time-input-${index}`}
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleStartTimeChange(e, index)}
                          label="Horário de Início"
                          inputProps={{
                            step: 300,
                          }}
                        />
                      </FormControl>
                      <FormControl sx={{ m: 1 }}>
                        <InputLabel htmlFor={`end-time-input-${index}`}>
                          Término
                        </InputLabel>
                        <OutlinedInput
                          id={`end-time-input-${index}`}
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleEndTimeChange(e, index)}
                          label="Horário de Término"
                          inputProps={{
                            step: 300,
                          }}
                        />
                      </FormControl>
                      <DeleteIcon onClick={() => handleDeleteDay(index)} />
                    </Box>
                  ))}
                  <Button onClick={handleAddDay}>Adicionar Dia</Button>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleClose}>Cancelar</Button>
                  <Button onClick={handleSaveSchedule}>Salvar</Button>
                </DialogActions>
              </Dialog>
            </Box>
            <Box>
              <Button
                variant="outlined"
                onClick={() => setOpenColor(true)}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "#FFFFFF",
                  },
                }}
              >
                Cor
              </Button>

              <Dialog
                disableEscapeKeyDown
                open={openColor}
                onClose={handleCloseColor}
              >
                <DialogTitle>Selecione a cor secundaria</DialogTitle>
                <DialogContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BlockPicker
                    color={color}
                    onChange={(newColor) => setColor(newColor.hex)}
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => setOpenColor(false)}>Voltar</Button>
                  <Button onClick={handleSaveColor}>Salvar</Button>
                </DialogActions>
              </Dialog>
            </Box>
            <Box>
              <Button
                variant="outlined"
                onClick={() => setOpenPayment(true)}
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "#FFFFFF",
                  },
                }}
              >
                Forma de Pagamento
              </Button>

              <Dialog
                disableEscapeKeyDown
                open={openPayment}
                onClose={handleClosePayment}
              >
                <DialogTitle>Selecione as formas de pagamentos</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth>
                    <InputLabel id="payment-select-label">
                      Formas de Pagamento
                    </InputLabel>
                    <Select
                      labelId="payment-select-label"
                      id="payment-select"
                      multiple
                      value={selectedPayments}
                      onChange={(e) => setSelectedPayments(e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {selected.map((payment) => (
                            <Chip
                              key={payment}
                              label={payment}
                              sx={{ margin: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="pix">PIX</MenuItem>
                      <MenuItem value="cartao_credito">
                        Cartão de Crédito
                      </MenuItem>
                      <MenuItem value="cartao_debito">
                        Cartão de Débito
                      </MenuItem>
                      <MenuItem value="vale_refeicao">Vale Refeição</MenuItem>
                      <MenuItem value="vale_alimentacao">
                        Vale Alimentação
                      </MenuItem>
                      <MenuItem value="dinheiro">Dinheiro</MenuItem>
                    </Select>
                  </FormControl>
                </DialogContent>

                <DialogActions>
                  <DialogActions>
                    <Button onClick={() => setOpenPayment(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePaymentOptions}>Salvar</Button>
                  </DialogActions>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "95%",
            }}
          >
            <Button variant="outlined">Salvar</Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "95%",
            height: "10rem",
            background: "#1E2C39",
            borderRadius: 3,
            pt: 1,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "95%",
              borderBottom: "1px #FFFFFF solid",
            }}
          >
            <Typography color={"#FFFFFF"}>Categoria</Typography>
            <AddRoundedIcon
              style={{ color: "#FFFFFF" }}
              onClick={() => setCreateCategory(true)}
            />
          </Box>
          <Box
            sx={{
              pt: "1rem",
              overflow: "auto",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              width: "95%",
            }}
          >
            {createCategory === true && edit === false ? (
              <>
                <OutlinedInput
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  sx={{ color: "#FFFFFF", borderColor: "#FFFFFF" }}
                  onClick={() => handleSave()}
                >
                  Adicionar
                  <CheckRoundedIcon />
                </Button>
              </>
            ) : (
              <>
                {databaseData &&
                  Object.keys(databaseData).map((category) => (
                    <Chip
                      sx={{
                        color: "#FFFFFF",
                        margin: "4px",
                        gap: "0.8rem",
                        p: "1rem",
                      }}
                      key={category}
                      label={category}
                      icon={
                        <>
                          <DeleteIcon
                            style={{ color: "red" }}
                            onClick={() => handleDelete(category)}
                          />
                          <EditRoundedIcon
                            style={{ color: "#FFFFFF", cursor: "pointer" }}
                            onClick={() => handleEdit(category)}
                          />
                        </>
                      }
                      variant="outlined"
                    />
                  ))}
              </>
            )}
            {edit === true ? (
              <>
                <>
                  <OutlinedInput
                    value={editedCategoryNewName}
                    onChange={(e) => setEditedCategoryNewName(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    sx={{ color: "#FFFFFF", borderColor: "#FFFFFF" }}
                    onClick={() => handleEditSave()}
                  >
                    Alterar
                    <CheckRoundedIcon />
                  </Button>
                </>
              </>
            ) : (
              <></>
            )}
          </Box>
        </Box>

        {databaseData &&
          Object.keys(databaseData).map((category) => (
            <Box
              key={category}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: getCategoryBackgroundColor(category),
                height: teste(category),
                overflow: overflow(category),
              }}
            >
              <Typography variant="h5">{category}</Typography>
              {Array.isArray(databaseData[category]) ? (
                databaseData[category].map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      margin: "10px",
                      maxWidth: "500px",
                      display: "none",
                    }}
                  >
                    <Typography variant="h6">
                      {item.sabor || item.name}
                    </Typography>
                    <Typography>Ingredientes: {item.ingredientes}</Typography>
                    <Typography>Valor: R${item.valor}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>Nenhum item encontrado nesta categoria.</Typography>
              )}
              {addNewItem && (
                <Box>
                  <OutlinedInput
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    variant="outlined"
                    label="Novo Item"
                  />
                  <Button onClick={handleAddItem}>Adicionar</Button>
                </Box>
              )}
              <Button onClick={() => setAddNewItem(!addNewItem)}>
                {addNewItem ? "Cancelar" : "Adicionar Novo Item"}
              </Button>
            </Box>
          ))}
      </Box>
    </>
  );
}

function getCategoryBackgroundColor(category) {
  switch (category) {
    case "drinks":
      return "lightblue";
    case "hamburger":
      return "blue";

    default:
      return "red";
  }
}
function teste(category) {
  switch (category) {
    case "drinks":
      return "5rem";
    case "hamburger":
      return "5rem";

    default:
      return "red";
  }
}
function overflow(category) {
  switch (category) {
    case "drinks":
      return "auto";
    case "hamburger":
      return "auto";

    default:
      return "auto";
  }
}
