package com.sive.bookingsystem.service.appointment.impl;

import com.sive.bookingsystem.dto.appointment.AppointmentDTO;
import com.sive.bookingsystem.dto.message.DataDTO;
import com.sive.bookingsystem.dto.message.MessageDTO;
import com.sive.bookingsystem.exception.appointment.AppointmentNotFoundException;
import com.sive.bookingsystem.model.appointment.AppointmentModel;
import com.sive.bookingsystem.model.appointment.AppointmentStatus;
import com.sive.bookingsystem.model.repository.appointment.AppointmentRepository;
import com.sive.bookingsystem.service.appointment.AppointmentService;
import com.sive.bookingsystem.service.event.bus.notification.NotificationProducerService;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;
    private final ModelMapper modelMapper;
    private final NotificationProducerService notificationProducerService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, NotificationProducerService notificationProducerService,
                                  ModelMapper modelMapper) {
        this.appointmentRepository = appointmentRepository;
        this.notificationProducerService = notificationProducerService;
        this.modelMapper = modelMapper;
    }

    @Override
    public AppointmentDTO saveAppointment(AppointmentDTO dto) {
        AppointmentModel model = convertDTOToEntity(dto);
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());
        model.setStatus(AppointmentStatus.SCHEDULED);
        model.setConfirmationCode(UUID.randomUUID().toString());
        model.setAppointmentDateTime(dto.getAppointmentDateTime());

        AppointmentModel saved = appointmentRepository.save(model);
        logger.info("Added Appointment: {}", saved);

        //issue event
        AppointmentDTO appointmentDTO = convertEntityToDTO(saved);

        if (!Objects.isNull(appointmentDTO)) {
            MessageDTO message = new MessageDTO("booking system", "notification trigger", "appointment-creation",
                    LocalDateTime.now(), UUID.randomUUID().toString(), "appointment successfully created", new DataDTO(appointmentDTO));
            notificationProducerService.publishEvent(message);
        }
        return appointmentDTO;
    }

    @Override
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto, Boolean pushEvent) {
        Optional<AppointmentModel> optional = appointmentRepository.findById(id);
        if (optional.isEmpty()) {
            logger.warn("Attempted to update non-existing appointment with id {}", id);
            throw new AppointmentNotFoundException(id);
        }

        AppointmentModel existing = optional.get();

        existing.setCustomerName(dto.getCustomerName());
        existing.setCustomerEmail(dto.getCustomerEmail());
        existing.setCustomerPhone(dto.getCustomerPhone());
        existing.setBranch(dto.getBranch());
        existing.setAppointmentDateTime(dto.getAppointmentDateTime());
        existing.setReason(dto.getReason());
        existing.setConfirmationCode(dto.getConfirmationCode());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setStatus(AppointmentStatus.valueOf(dto.getStatus()));

        if (dto.getStatus() != null) {
            try {
                existing.setStatus(AppointmentStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.error("Invalid status provided: {}", dto.getStatus(), e);
            }
        }

        AppointmentModel saved = appointmentRepository.save(existing);
        logger.info("Appointment updated successfully: {}", saved);

        //issue event
        AppointmentDTO appointmentDTO = convertEntityToDTO(saved);

        if (pushEvent && !Objects.isNull(appointmentDTO)) {
            MessageDTO message = new MessageDTO("booking system", "notification trigger", "appointment-updated",
                    LocalDateTime.now(), UUID.randomUUID().toString(), "appointment successfully updated", new DataDTO(appointmentDTO));
            notificationProducerService.publishEvent(message);
        }
        return appointmentDTO;
    }

    @Override
    public void deleteAppointment(Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            logger.info("Deleted appointment with id {}", id);
        } else {
            logger.warn("Attempted to delete non-existing appointment with id {}", id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO findById(Long id) {
        return appointmentRepository.findById(id)
                .map(this::convertEntityToDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findByCustomerName(String customerName) {
        return appointmentRepository.findByCustomerName(customerName).stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findAll() {
        return appointmentRepository.findAll().stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    private AppointmentModel convertDTOToEntity(AppointmentDTO dto) {
        return modelMapper.map(dto, AppointmentModel.class);
    }

    private AppointmentDTO convertEntityToDTO(AppointmentModel model) {
        return modelMapper.map(model, AppointmentDTO.class);
    }
}

