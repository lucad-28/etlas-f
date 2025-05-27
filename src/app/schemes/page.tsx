"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Copy, Eye, Plus, Check, Pencil, Trash } from "lucide-react";
import { Scheme, SchemeCreate, SchemeUpdate } from "@/types/models/scheme";
import { Modal } from "@/components/Modal";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Noise } from "@/components/Noise";
import { toastVariables } from "@/components/ToastVariables";
import { NoiseType } from "@/types/noise";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SchemesPage() {
  const sample: Scheme = {
    id: "1",
    title: "Default Scheme",
    content:
      "CREATE TABLE autores (\n    autor_id INT PRIMARY KEY AUTO_INCREMENT,\n    nombre VARCHAR(50) NOT NULL,\n    apellido VARCHAR(50) NOT NULL,\n    fecha_nacimiento DATE,\n    nacionalidad VARCHAR(50)\n);\n-- Tabla de Categorías\nCREATE TABLE categorias (\n    categoria_id INT PRIMARY KEY AUTO_INCREMENT,\n    nombre VARCHAR(50) NOT NULL,\n    descripcion TEXT\n);\n-- Tabla de Libros\nCREATE TABLE libros (\n    libro_id INT PRIMARY KEY AUTO_INCREMENT,\n    titulo VARCHAR(100) NOT NULL,\n    autor_id INT,\n    categoria_id INT,\n    precio DECIMAL(10,2) NOT NULL,\n    stock INT NOT NULL DEFAULT 0,\n    fecha_publicacion DATE,\n    FOREIGN KEY (autor_id) REFERENCES autores(autor_id),\n    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id)\n);\n-- Tabla de Clientes\nCREATE TABLE clientes (\n    cliente_id INT PRIMARY KEY AUTO_INCREMENT,\n    nombre VARCHAR(50) NOT NULL,\n    apellido VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE,\n    telefono VARCHAR(20),\n    fecha_registro DATE DEFAULT CURRENT_DATE\n);\n-- Tabla de Ventas\nCREATE TABLE ventas (\n    venta_id INT PRIMARY KEY AUTO_INCREMENT,\n    cliente_id INT,\n    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,\n    total DECIMAL(10,2) NOT NULL,\n    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id)\n);\n-- Tabla de Detalles de Venta (tabla intermedia)\nCREATE TABLE detalle_ventas (\n    detalle_id INT PRIMARY KEY AUTO_INCREMENT,\n    venta_id INT,\n    libro_id INT,\n    cantidad INT NOT NULL,\n    precio_unitario DECIMAL(10,2) NOT NULL,\n    subtotal DECIMAL(10,2) NOT NULL,\n    FOREIGN KEY (venta_id) REFERENCES ventas(venta_id),\n    FOREIGN KEY (libro_id) REFERENCES libros(libro_id)\n);",
    attachment_url: "https://example.com/attachment.png",
    created_at: new Date(),
  };
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemeView, setSchemeView] = useState<Scheme>();
  const [schemeEdit, setSchemeEdit] = useState<Scheme>();
  const [schemeCreate, setSchemeCreate] = useState<boolean>(false);
  const [noise, setNoise] = useState<NoiseType | undefined>({
    type: "loading",
    styleType: "page",
    message: "Loading schemes...",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    const fetchSchemes = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ETLAS_API_URL}/schemes/by`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user.id,
          limit: 100,
          offset: 0,
        }),
      });

      if (!res.ok) {
        console.error("Failed to fetch schemes");
        toastVariables.error("Failed to fetch schemes");
        return;
      }

      const data = await res.json();
      console.log("Fetched schemes:", data);
      setSchemes(data.data || []); // Use sample if no schemes found
      setNoise(undefined); // Clear noise once data is fetched
    };
    fetchSchemes();
  }, []);

  const handleCopy = (e: React.MouseEvent, scheme: Scheme) => {
    e.stopPropagation();
    navigator.clipboard.writeText(scheme.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    console.log("errors:", errors);
  }, [errors]);

  const onSubmit = async (data: FormValues) => {
    if (!schemeEdit && !schemeCreate) return;

    if (schemeEdit) {
      const updatedValues: SchemeUpdate = {
        id: schemeEdit.id,
      };

      /* if (data.attachment_url || data.attachment_url === "") {
        updatedValues.attachment_url = data.attachment_url;
      } */

      if (
        (data.title || data.title === "") &&
        data.title !== schemeEdit.title
      ) {
        updatedValues.title = data.title;
      }

      if (
        (data.content || data.content === "") &&
        data.content !== schemeEdit.content
      ) {
        updatedValues.content = data.content;
      }

      setNoise({
        type: "loading",
        styleType: "modal",
        message: "Updating scheme...",
      });

      try {
        console.log("Updating scheme with values:", updatedValues);
        const res = await fetch(`${process.env.NEXT_PUBLIC_ETLAS_API_URL}/schemes/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedValues),
        });

        if (!res.ok) {
          throw new Error("Failed at fetch");
        }

        const updatedScheme = await res.json();

        console.log("Updated scheme:", updatedScheme);
        setSchemes((prev) => {
          return prev.map((scheme) =>
            scheme.id === schemeEdit.id
              ? {
                  ...scheme,
                  title: updatedScheme.title,
                  content: updatedScheme.content,
                  attachment_url: updatedScheme.attachment_url,
                }
              : scheme
          );
        });
        setSchemeEdit(undefined);
        reset();
        setNoise(undefined);
        toastVariables.success("Scheme updated successfully");
      } catch (error) {
        console.error("Error updating scheme:", error);
        setNoise(undefined);
        setSchemeEdit(undefined);
        reset();
        toastVariables.error("Failed to update scheme");
      }
    } else if (schemeCreate) {
      const newScheme: SchemeCreate = {
        title: data.title,
        content: data.content,
        user_id: session?.user.id || "",
      };

      setNoise({
        type: "loading",
        styleType: "modal",
        message: "Creating scheme...",
      });

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ETLAS_API_URL}/schemes/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newScheme),
        });

        if (!res.ok) {
          throw new Error("Failed to create scheme");
        }

        const createdScheme = await res.json();
        console.log("Created scheme:", createdScheme);
        setSchemes((prev) => [...prev, createdScheme]);
        setSchemeCreate(false);
        reset();
        setNoise(undefined);
        toastVariables.success("Scheme created successfully");
      } catch (error) {
        console.error("Error creating scheme:", error);
        setNoise(undefined);
        setSchemeCreate(false);
        reset();
        toastVariables.error("Failed to create scheme");
      }
    }
  };

  const handleEdit = (scheme: Scheme) => {
    setValue("title", scheme.title);
    setValue("content", scheme.content);
    /*     setValue("attachment_url", scheme.attachment_url || "");
     */ setSchemeEdit(scheme);
  };

  if (noise && noise.styleType === "page") {
    return <Noise noise={noise} />;
  }

  return (
    <div className="h-lvh">
      {noise && <Noise noise={noise} />}
      <div className="flex h-[10vh] justify-between items-center p-8">
        <h1 className="text-2xl font-bold">Schemes</h1>
        <Button onClick={() => setSchemeCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scheme
        </Button>
      </div>

      <div className="h-[90vh] p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme) => (
          <Card key={scheme.id} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {scheme.title}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 m-0 flex items-center justify-center"
                    onClick={() => handleEdit(scheme)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 m-0 flex items-center justify-center"
                  >
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <div className="w-full px-6 pb-4 h-[30vh]">
              <div className="h-full w-full bg-muted rounded-xl overflow-hidden relative">
                <div
                  className="absolute top-0 right-0 z-20 rounded-bl-lg rounded-tl-lg bg-gradient-to-bl from-muted-foreground via-muted-foreground/60 to-transparent flex items-center justify-end p-2 hover:scale-110 transition-transform duration-300 cursor-pointer"
                  onClick={(e) => {
                    handleCopy(e, scheme);
                  }}
                >
                  {copied ? (
                    <Check className="h-4 w-4 m-2 text-white animate-circular-dash" />
                  ) : (
                    <Copy className="h-4 w-4 m-2 text-white" />
                  )}{" "}
                </div>
                <div
                  className="w-full bg-black/35 h-full z-10 absolute flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                  onClick={() => setSchemeView(scheme)}
                >
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <pre className="p-4 text-sm w-full text-ellipsis opacity-60">
                  <code>{scheme.content}</code>
                </pre>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {schemeView && (
        <Modal onClose={() => setSchemeView(undefined)} customZIndex={3000}>
          <div className="flex flex-col gap-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Scheme Details</h2>
              <span className="text-sm text-muted-foreground">
                Created at:{" "}
                {new Date(schemeView.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-medium">{schemeView.title}</h3>
            <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto">
              <code>{schemeView.content}</code>
            </pre>
          </div>
        </Modal>
      )}

      {(schemeEdit || schemeCreate) && (
        <Modal
          onClose={() => {
            setSchemeEdit(undefined);
            setSchemeCreate(false);
            reset();
          }}
          customZIndex={3000}
        >
          <div className="flex flex-col gap-4 w-[50vw] h-[80vh]">
            <h2 className="text-xl font-bold">Edit Scheme</h2>
            <form
              className="flex flex-col gap-4 w-full h-full px-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="flex flex-col font-bold">
                <span className={`${errors.title ? "text-red-500" : ""}`}>
                  Title
                </span>
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Title of the scheme"
                    className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring"
                  />
                )}
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}

              <label className="flex flex-col font-bold">
                <span className={`${errors.content ? "text-red-500" : ""}`}>
                  Content
                </span>
              </label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value}
                    placeholder="Scheme content"
                    className="p-2 border rounded-md flex-1 resize-none"
                  />
                )}
              />
              {errors.content && (
                <span className="text-red-500 text-sm">
                  {errors.content.message}
                </span>
              )}
              <Button type="submit" className="self-end">
                Save Changes
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
