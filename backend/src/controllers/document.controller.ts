import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getDocuments = async (
  req: Request,
  res: Response,
): Promise<any> => {
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

export const createDocument = async (
  req: Request,
  res: Response,
): Promise<any> => {
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
  });

  res.json(document);
};

export const getDocument = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { id } = req.params;
  const session = (req as any).session;

  const document = await prisma.document.findUnique({
    where: { id: id as string },
    include: {
      collaborators: true,
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

export const updateDocument = async (
  req: Request,
  res: Response,
): Promise<any> => {
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
  });

  res.json(updatedDocument);
};
