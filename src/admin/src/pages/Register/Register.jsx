/* eslint-disable react-hooks/rules-of-hooks */
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
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField,
} from "@mui/material";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import {
  get,
  getDatabase,
  ref,
  set,
  onValue,
  off,
  push,
} from "firebase/database";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { BlockPicker } from "react-color";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import { useFormat } from "../../../../utils/useFormat";
export default function Register() {
  const [databaseData, setDatabaseData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [createCategory, setCreateCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedCategoryNewName, setEditedCategoryNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [additionalDays, setAdditionalDays] = useState([]);
  const [openColor, setOpenColor] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [newProductData, setNewProductData] = useState({
    id: "",
    sabor: "",
    valor: "",
    imagem: "", // Adicione outros campos conforme necessário
  });
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
  useEffect(() => {
    const colorRef = ref(getDatabase(), "corsecundaria");
    onValue(colorRef, (snapshot) => {
      const colorFromDB = snapshot.val();
      if (colorFromDB) {
        setColor(colorFromDB);
      }
    });
    return () => off(colorRef);
  }, []);

  useEffect(() => {
    const paymentOptionsRef = ref(getDatabase(), "formaDePagamentos");
    onValue(paymentOptionsRef, (snapshot) => {
      const paymentOptionsFromDB = snapshot.val();
      if (paymentOptionsFromDB) {
        setSelectedPayments(paymentOptionsFromDB);
      }
    });
    return () => off(paymentOptionsRef);
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
  const handleEditProduct = (product) => {
    setEditedProduct(product);
    setEditProductDialogOpen(true);
  };

  const handleSaveEditedProduct = async (category, editedProduct) => {
    try {
      if (editedProduct && category) {
        const { id, ...updatedFields } = editedProduct;
        updatedFields.valor = parseFloat(updatedFields.valor);

        const db = getDatabase();
        const categoryRef = ref(db, category);

        const snapshot = await get(categoryRef);
        const currentData = snapshot.val();

        if (currentData) {
          if (Array.isArray(currentData)) {
            const productIndex = currentData.findIndex(
              (item) => item.id === id
            );
            if (productIndex !== -1) {
              currentData[productIndex] = { id, ...updatedFields };
            } else {
              console.error("Produto não encontrado na categoria:", category);
              return;
            }
          } else if (typeof currentData === "object") {
            const itemToUpdate = findItemById(currentData, id);
            if (itemToUpdate) {
              Object.assign(itemToUpdate, updatedFields);
            } else {
              console.error("Item não encontrado na categoria:", category);
              return;
            }
          }

          await set(categoryRef, currentData);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setEditProductDialogOpen(false);
          setEditedProduct(null);
        } else {
          console.error(
            "Categoria não encontrada ou dados inválidos:",
            category
          );
        }
      } else {
        console.error(
          "Erro ao salvar as alterações do produto: editedProduct ou category é null ou undefined"
        );
      }
    } catch (error) {
      console.error("Erro ao salvar as alterações do produto:", error);
    }
  };

  const findItemById = (object, id) => {
    if (!object || typeof object !== "object") {
      return null;
    }

    if (object.id === id) {
      return object;
    }

    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = object[key];

      if (value && typeof value === "object") {
        const foundInChildren = findItemById(value, id);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }

    return null;
  };
  const handleOpenAddProductDialog = (category) => {
    setSelectedCategory(category);
    setOpenAddProductDialog(true);
  };

  const handleCloseAddProductDialog = () => {
    setOpenAddProductDialog(false);
  };

  const handleAddProduct = async (category) => {
    try {
      if (newProductData && category) {
        const db = getDatabase();
        const categoryRef = ref(db, category);
        console.log(categoryRef);

        const newProductId = push(categoryRef).key;

        const newProduct = {
          id: newProductId,
          sabor: newProductData.sabor,
          valor: parseFloat(newProductData.valor),
          imagem: newProductData.imagem,
        };

        await set(ref(categoryRef, newProductId), newProduct);

        console.log("Novo produto adicionado na categoria:", category);

        setNewProductData({
          id: "",
          sabor: "",
          valor: "",
          imagem: "",
        });
        setOpenAddProductDialog(false);
      } else {
        console.error(
          "Erro ao adicionar produto: newProductData ou category é null ou undefined"
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
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
          overflow: "auto",
        }}
      >
        <Header />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "95%",
              height: "20rem",
              background: "#1E2C39",
              borderRadius: 3,
              mt: 3,
              mb: 3,
              pt: 1,
              pb: 1,
              flexShrink: 0,
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
              <Typography color={"#FFFFFF"}>
                Dados do estabelecimento
              </Typography>
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
                  <DialogTitle>
                    Selecione o horário de funcionamento
                  </DialogTitle>
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
                            <MenuItem value="Segunda">Segunda-feira</MenuItem>
                            <MenuItem value="Terça">Terça-feira</MenuItem>
                            <MenuItem value="Quarta">Quarta-feira</MenuItem>
                            <MenuItem value="Quinta">Quinta-feira</MenuItem>
                            <MenuItem value="Sexta">Sexta-feira</MenuItem>
                            <MenuItem value="Sábado">Sábado</MenuItem>
                            <MenuItem value="Domingo">Domingo</MenuItem>
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
                        <MenuItem value="cartao_de_credito">
                          Cartão de Crédito
                        </MenuItem>
                        <MenuItem value="cartao_de_debito">
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
                <Dialog
                  open={openAddProductDialog}
                  onClose={handleCloseAddProductDialog}
                >
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="ID"
                      value={newProductData.id}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          id: e.target.value,
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Sabor"
                      value={newProductData.sabor}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          sabor: e.target.value,
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Valor"
                      value={newProductData.valor}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          valor: e.target.value,
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Imagem"
                      value={newProductData.imagem}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          imagem: e.target.value,
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    {/* Adicione mais campos conforme necessário */}
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleCloseAddProductDialog}
                      color="primary"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddProduct} color="primary">
                      Salvar produto
                    </Button>
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
              height: "14rem",
              background: "#1E2C39",
              borderRadius: 3,
              pt: 1,
              pb: 1,
              flexShrink: 0,
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "95%",
              height: "auto",
              background: "#1E2C39",
              borderRadius: 3,
              mt: 3,
              pt: 1,
              pb: 1,
              mb: 4,
              flexShrink: 0,
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
              <Typography color={"#FFFFFF"}>Produtos</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                width: "99%",
              }}
            >
              <List sx={{ width: "100%" }}>
                {databaseData &&
                  Object.keys(databaseData).map((category) => {
                    if (
                      category === "corsecundaria" ||
                      category === "horario_de_funcionamento" ||
                      category === "formaDePagamentos" ||
                      category === "opcionais" ||
                      category === "adicionais"
                    ) {
                      return null;
                    }

                    return (
                      <div key={category}>
                        <ListItemButton
                          sx={{ color: "#FFFFFF" }}
                          onClick={() =>
                            setSelectedCategory((prevCategory) =>
                              prevCategory === category ? null : category
                            )
                          }
                        >
                          <ListItemText primary={category} />
                          {selectedCategory === category ? (
                            <ArrowDropUpRoundedIcon />
                          ) : (
                            <ArrowDropDownRoundedIcon />
                          )}
                        </ListItemButton>
                        <Collapse
                          in={selectedCategory === category}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            {Object.keys(databaseData[category] || {}).map(
                              (productName, index) => {
                                const product =
                                  databaseData[category][productName];

                                const { id, imagem, sabor, valor } = product;

                                return (
                                  <>
                                    <ListItemButton key={index}>
                                      <ListItemButton
                                        key={index}
                                        sx={{
                                          pl: 1,
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          color: "#FFFFFF",
                                        }}
                                      >
                                        <Typography variant="subtitle2">
                                          ID: {id}
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            width: "4rem",
                                            overflow: "hidden",
                                          }}
                                        >
                                          <img
                                            src={imagem}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              borderRadius: 3,
                                            }}
                                          />
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            width: "4rem",
                                            overflow: "hidden",
                                            gap: 1,
                                          }}
                                        >
                                          <Typography sx={{ height: "100%" }}>
                                            Preço
                                          </Typography>
                                          <Typography
                                            sx={{
                                              fontWeight: 700,
                                              fontSize: 14,
                                            }}
                                          >
                                            {useFormat(valor)}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            width: "12rem",
                                            overflow: "hidden",
                                            gap: 1,
                                          }}
                                        >
                                          <Typography sx={{ height: "100%" }}>
                                            Produto
                                          </Typography>
                                          <Typography sx={{ fontWeight: 700 }}>
                                            {sabor}
                                          </Typography>
                                        </Box>
                                      </ListItemButton>
                                      <EditRoundedIcon
                                        style={{
                                          color: "#FFFFFF",
                                          marginRight: 5,
                                        }}
                                        onClick={() => {
                                          console.log(
                                            "Produto selecionado para edição:",
                                            product
                                          );
                                          handleEditProduct(product);
                                        }}
                                      />
                                      <Typography> | </Typography>
                                      <DeleteIcon
                                        style={{
                                          color: "red",
                                          marginLeft: 5,
                                        }}
                                      />
                                    </ListItemButton>
                                    <Dialog
                                      open={editProductDialogOpen}
                                      onClose={() =>
                                        setEditProductDialogOpen(false)
                                      }
                                    >
                                      <DialogTitle>Editar Produto</DialogTitle>
                                      <DialogContent>
                                        {/* Campos de entrada para editar os detalhes do produto */}
                                        <TextField
                                          label="Sabor"
                                          value={
                                            editedProduct
                                              ? editedProduct.sabor
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setEditedProduct({
                                              ...editedProduct,
                                              sabor: e.target.value,
                                            })
                                          }
                                        />
                                        <TextField
                                          label="ID"
                                          value={
                                            editedProduct
                                              ? editedProduct.id
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setEditedProduct({
                                              ...editedProduct,
                                              id: e.target.value,
                                            })
                                          }
                                          disabled
                                        />
                                        <TextField
                                          label="Valor"
                                          value={
                                            editedProduct
                                              ? editedProduct.valor
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setEditedProduct({
                                              ...editedProduct,
                                              valor: e.target.value,
                                            })
                                          }
                                        />
                                        <TextField
                                          label="Ingredientes"
                                          value={
                                            editedProduct
                                              ? editedProduct.ingredientes
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setEditedProduct({
                                              ...editedProduct,
                                              ingredientes: e.target.value,
                                            })
                                          }
                                        />
                                        {/* Adicione mais campos de entrada conforme necessário */}
                                      </DialogContent>
                                      <DialogActions>
                                        <Button
                                          onClick={() =>
                                            setEditProductDialogOpen(false)
                                          }
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleSaveEditedProduct(
                                              selectedCategory,
                                              editedProduct
                                            )
                                          }
                                        >
                                          Salvar alteração
                                        </Button>
                                      </DialogActions>
                                    </Dialog>
                                  </>
                                );
                              }
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                width: "99%",
                              }}
                            >
                              <Button
                                onClick={() =>
                                  handleOpenAddProductDialog(selectedCategory)
                                }
                                variant="outlined"
                                sx={{
                                  color: "#FFFFFF",
                                  borderColor: "#FFFFFF",
                                }}
                              >
                                <AddRoundedIcon />
                                Adicionar produto
                              </Button>
                            </Box>
                          </List>
                        </Collapse>
                      </div>
                    );
                  })}
              </List>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
