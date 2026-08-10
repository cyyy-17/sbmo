-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateOfIncident" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "severity" TEXT NOT NULL DEFAULT 'MINOR',
    "reporterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentStudent" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "involvementType" TEXT NOT NULL,
    "statement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViolationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationType" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViolationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentViolation" (
    "id" TEXT NOT NULL,
    "incidentStudentId" TEXT NOT NULL,
    "violationTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incident_referenceNumber_key" ON "Incident"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentStudent_incidentId_studentId_involvementType_key" ON "IncidentStudent"("incidentId", "studentId", "involvementType");

-- CreateIndex
CREATE UNIQUE INDEX "ViolationCategory_name_key" ON "ViolationCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentViolation_incidentStudentId_violationTypeId_key" ON "IncidentViolation"("incidentStudentId", "violationTypeId");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentStudent" ADD CONSTRAINT "IncidentStudent_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentStudent" ADD CONSTRAINT "IncidentStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationType" ADD CONSTRAINT "ViolationType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ViolationCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentViolation" ADD CONSTRAINT "IncidentViolation_incidentStudentId_fkey" FOREIGN KEY ("incidentStudentId") REFERENCES "IncidentStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentViolation" ADD CONSTRAINT "IncidentViolation_violationTypeId_fkey" FOREIGN KEY ("violationTypeId") REFERENCES "ViolationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
