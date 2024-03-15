import { Box, Button, Chip, Typography, TextField } from "@mui/material";
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
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

export default function Register() {
  const [databaseData, setDatabaseData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [addNewItem, setAddNewItem] = useState(false);
  const [editedCategoryNewName, setEditedCategoryNewName] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const databaseRef = ref(db);

    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        setDatabaseData(snapshot.val());
        console.log("Dados do banco de dados atualizados:", snapshot.val());
      } else {
        console.log("Nenhum dado encontrado no banco de dados.");
      }
    };

    const handleError = (error) => {
      console.error("Erro ao buscar dados do banco de dados:", error);
    };

    onValue(databaseRef, handleData, handleError);

    return () => off(databaseRef, "value", handleData);
  }, []);

  const handleDelete = async (category) => {
    const db = getDatabase();
    const categoryRef = ref(db, category);

    try {
      await set(categoryRef, null);
      console.log("Categoria e itens removidos com sucesso:", category);
    } catch (error) {
      console.error("Erro ao remover categoria e itens:", error);
    }
  };

  const handleEdit = (category) => {
    setEdit(true);
    setEditedCategoryName(category);
    setEditedCategoryNewName(category);
  };

  const handleSave = async () => {
    setEdit(false);
    const db = getDatabase();
    try {
      if (editedCategoryNewName.trim() === "") {
        if (editedCategoryName.trim() !== "") {
          const categoryRef = ref(db, editedCategoryName);
          const snapshot = await get(categoryRef);
          if (snapshot.exists()) {
            console.log("A categoria já existe:", editedCategoryName);
          } else {
            // Adicionamos a nova categoria ao banco de dados
            await set(categoryRef, [editedCategoryName]);
            console.log("Nova categoria adicionada:", editedCategoryName);
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
          console.log(
            "Categoria atualizada:",
            editedCategoryName,
            "para",
            editedCategoryNewName
          );
        } else {
          console.log("Os nomes da categoria não podem ser vazios.");
        }
      }
      setEditedCategoryName("");
      setEditedCategoryNewName("");
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
        console.log("Novo item adicionado à categoria:", newItemValue);
        setNewItemValue("");
      } catch (error) {
        console.error("Erro ao adicionar novo item à categoria:", error);
      }
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
          overflow: "hidden",
        }}
      >
        <Header />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
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
              justifyContent: "flex-start",
              width: "95%",
              borderBottom: "1px #FFFFFF solid",
            }}
          >
            <Typography color={"#FFFFFF"}>Categoria</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              flexWrap: "wrap",
              width: "95%",
            }}
          >
            {databaseData &&
              Object.keys(databaseData).map((category) => (
                <Chip
                  sx={{ color: "#FFFFFF", margin: "4px" }}
                  key={category}
                  label={category}
                  onDelete={() => handleDelete(category)}
                  deleteIcon={<DeleteIcon style={{ color: "red" }} />}
                  variant="outlined"
                  onClick={() => handleEdit(category)}
                />
              ))}
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
            {!edit ? (
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                }}
                onClick={() => setEdit(true)}
              >
                Editar categoria
                <AddCircleOutlineRoundedIcon />
              </Button>
            ) : (
              <>
                <TextField
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  variant="outlined"
                  label="Nome da Categoria"
                  sx={{ mr: 2 }}
                />

                <Button
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    color: "#FFFFFF",
                    borderColor: "#FFFFFF",
                  }}
                  onClick={handleSave}
                >
                  Salvar alterações
                  <AddCircleOutlineRoundedIcon />
                </Button>
              </>
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
                    {/* Adicione aqui qualquer lógica adicional específica para cada categoria */}
                  </Box>
                ))
              ) : (
                <Typography>Nenhum item encontrado nesta categoria.</Typography>
              )}
              {addNewItem && (
                <Box>
                  <TextField
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

// Função para retornar a cor de fundo com base na categoria
function getCategoryBackgroundColor(category) {
  switch (category) {
    case "drinks":
      return "lightblue";
    case "hamburger":
      return "blue";
    // Adicione mais casos conforme necessário para outras categorias
    default:
      return "red"; // Padrão para outras categorias
  }
}
function teste(category) {
  switch (category) {
    case "drinks":
      return "5rem";
    case "hamburger":
      return "5rem";
    // Adicione mais casos conforme necessário para outras categorias
    default:
      return "red"; // Padrão para outras categorias
  }
}
function overflow(category) {
  switch (category) {
    case "drinks":
      return "auto";
    case "hamburger":
      return "auto";
    // Adicione mais casos conforme necessário para outras categorias
    default:
      return "auto"; // Padrão para outras categorias
  }
}
