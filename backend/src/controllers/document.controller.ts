import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getDocuments = async (req: Request, res: Response) => {
  const session = (req as any).session;

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json(documents);
};

export const createDocument = async (req: Request, res: Response) => {
  const session = (req as any).session;

  const { title } = req.body;

  const document = await prisma.document.create({
    data: {
      title: title || "Untitled",
      content: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
      ownerId: session.user.id,
    },
    include: {
      collaborators: {
        include: {
          user: true,
        },
      },
      owner: true,
    },
  });

  res.json(document);
};

export const getDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = (req as any).session;

  const document = await prisma.document.findUnique({
    where: { id: id as string },
    include: {
      collaborators: {
        include: {
          user: true,
        },
      },
      owner: true,
    },
  });

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Check if owner or collaborator
  const isCollaborator = document.collaborators.some(
    (c) => c.userId === session.user.id,
  );
  if (document.ownerId !== session.user.id && !isCollaborator) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(document);
};

export const updateDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const session = (req as any).session;

  const document = await prisma.document.findUnique({
    where: { id: id as string },
    include: { collaborators: true },
  });

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Check permissions: owner or EDITOR
  const collaboration = document.collaborators.find(
    (c) => c.userId === session.user.id,
  );
  const isOwner = document.ownerId === session.user.id;
  const canEdit =
    isOwner ||
    collaboration?.role === "EDITOR" ||
    collaboration?.role === "OWNER";

  if (!canEdit) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updatedDocument = await prisma.document.update({
    where: { id: id as string },
    data: {
      title,
      content,
    },
    include: {
      collaborators: {
        include: {
          user: true,
        },
      },
      owner: true,
    },
  });

  res.json(updatedDocument);
};

export const deleteDocument = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = (req as any).session;

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Only owner can delete
  if (document.ownerId !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.document.delete({
    where: { id: id as string },
  });

  res.json({ success: true });
};

export const addCollaborator = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { email, role } = req.body;
  const session = (req as any).session;

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Only owner can add collaborators
  if (document.ownerId !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const userToAdd = await prisma.user.findUnique({
    where: { email },
  });

  if (!userToAdd) {
    return res.status(404).json({ error: "User not found" });
  }

  const collaboration = await prisma.collaboration.upsert({
    where: {
      userId_documentId: {
        userId: userToAdd.id,
        documentId: id,
      },
    },
    update: {
      role: role || "VIEWER",
    },
    create: {
      userId: userToAdd.id,
      documentId: id,
      role: role || "VIEWER",
    },
  });

  res.json(collaboration);
};
